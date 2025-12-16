from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import update_last_login
from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_date
from datetime import datetime, time
from django.http import HttpResponse
from django.conf import settings
from .models import Usuario, Evento, Reserva
from .serializers import UsuarioSerializer, EventoSerializer, ReservaSerializer
from rest_framework.parsers import MultiPartParser, FormParser
import uuid
import csv
import traceback

class EventoViewSet(viewsets.ModelViewSet):
    serializer_class = EventoSerializer
    queryset = Evento.objects.all()
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        queryset = Evento.objects.all().order_by('fecha_inicio')

        search_query = self.request.query_params.get('search', None)
        fecha_query = self.request.query_params.get('fecha', None)

        if search_query:
            queryset = queryset.filter(
                Q(nombre__icontains=search_query) |
                Q(ubicacion__icontains=search_query)
            )

        if fecha_query:
            fecha_obj = parse_date(fecha_query)
            if fecha_obj:
                start_of_day = timezone.make_aware(datetime.combine(fecha_obj, time.min))
                end_of_day = timezone.make_aware(datetime.combine(fecha_obj, time.max))
                queryset = queryset.filter(fecha_inicio__range=(start_of_day, end_of_day))

        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

class ReservaViewSet(viewsets.ModelViewSet):
    serializer_class = ReservaSerializer
    queryset = Reserva.objects.all()
    permission_classes = [IsAuthenticated]  # por defecto, sobreescrito en get_permissions

    def get_permissions(self):
        # Permitir crear reservas a invitados (AllowAny), pero para otras acciones requerir autenticación
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, 'is_staff') and user.is_staff:
            queryset = Reserva.objects.all().order_by('-fecha_reserva')
        else:
            # Si no está autenticado, devolvemos queryset vacío (no permitimos ver reservas de otros)
            if not (user and user.is_authenticated):
                return Reserva.objects.none()
            queryset = Reserva.objects.filter(usuario=user).order_by('-fecha_reserva')

        # Filtros admin
        if user.is_staff:
            search_query = self.request.query_params.get('search', None)
            fecha_inicio = self.request.query_params.get('fecha_inicio', None)
            fecha_fin = self.request.query_params.get('fecha_fin', None)

            if search_query:
                queryset = queryset.filter(
                    Q(codigo_reserva__icontains=search_query) |
                    Q(evento__nombre__icontains=search_query) |
                    Q(usuario__email__icontains=search_query)
                )

            if fecha_inicio and fecha_fin:
                queryset = queryset.filter(fecha_reserva__range=[fecha_inicio, fecha_fin])

        return queryset

    # ASIGNACIÓN CORRECTA DEL USUARIO O NULL PARA INVITADOS
    def perform_create(self, serializer):
        user = self.request.user if (self.request.user and getattr(self.request.user, 'is_authenticated', False)) else None
        serializer.save(usuario=user)

    # Cancelar reserva
    @action(detail=True, methods=['patch'])
    def cancelar(self, request, pk=None):
        try:
            reserva = Reserva.objects.get(pk=pk)
        except Reserva.DoesNotExist:
            return Response({"error": "Reserva no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        if reserva.usuario != request.user and not request.user.is_staff:
            return Response({"error": "No tienes permiso para cancelar esta reserva."}, status=status.HTTP_403_FORBIDDEN)

        if reserva.estado_reserva == 'cancelada':
            return Response({"mensaje": "La reserva ya está cancelada."}, status=status.HTTP_200_OK)

        reserva.estado_reserva = 'cancelada'
        reserva.save()
        return Response({"mensaje": "Reserva cancelada exitosamente."}, status=status.HTTP_200_OK)

    # Exportar CSV
    @action(detail=False, methods=['get'])
    def reporte(self, request):
        reservas = self.get_queryset()

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="reporte_reservas.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Codigo', 'Evento', 'Usuario', 'Plazas', 'Fecha', 'Estado'])

        for r in reservas:
            writer.writerow([
                r.id,
                r.codigo_reserva,
                r.evento.nombre,
                r.usuario.email if r.usuario else '',
                r.cantidad_plazas,
                r.fecha_reserva.strftime("%Y-%m-%d %H:%M"),
                r.estado_reserva
            ])

        return response

    # Bloqueo de edición
    def update(self, request, *args, **kwargs):
        return Response({"error": "No se permite editar."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def partial_update(self, request, *args, **kwargs):
        return Response({"error": "No se permite editar."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    # Crear reserva
    def create(self, request, *args, **kwargs):
        evento_id = request.data.get('evento')

        try:
            cantidad = int(request.data.get('cantidad_plazas', 1))
            if cantidad <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response({"error": "Cantidad inválida."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            evento = Evento.objects.get(id=evento_id)
        except Evento.DoesNotExist:
            return Response({"error": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if evento.estado != 'activo' or evento.fecha_inicio < timezone.now():
            return Response({"error": "Evento no disponible."}, status=status.HTTP_400_BAD_REQUEST)

        ocupados = sum(
            r.cantidad_plazas for r in
            Reserva.objects.filter(evento=evento, estado_reserva='confirmada')
        )

        if ocupados + cantidad > evento.capacidad:
            return Response(
                {"error": f"Sin cupos. Quedan {evento.capacidad - ocupados}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = request.data.copy()

        # Si el usuario no está autenticado, requerimos nombre_contacto y email_contacto
        if not (request.user and getattr(request.user, 'is_authenticated', False)):
            if not data.get('nombre_contacto') or not data.get('email_contacto'):
                return Response({"error": "Para reservar como invitado se requiere nombre y email de contacto."},
                                status=status.HTTP_400_BAD_REQUEST)

        # Generamos un codigo único; lo guardamos en una variable y pasamos a serializer.save()
        codigo_generado = "RES-" + uuid.uuid4().hex[:8].upper()

        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
            # Pasamos usuario (o None) y el codigo generado directamente a save()
            user = request.user if (request.user and getattr(request.user, 'is_authenticated', False)) else None
            serializer.save(usuario=user, codigo_reserva=codigo_generado)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Log en consola
            tb = traceback.format_exc()
            print("ERROR crear reserva:\n", tb)
            # Devuelve detalle solo si DEBUG=True
            if getattr(settings, "DEBUG", False):
                return Response({
                    "error": "Error interno del servidor durante creación de reserva.",
                    "detail": str(e),
                    "traceback": tb
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({
                    "error": "Error interno del servidor durante creación de reserva."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Usuario.objects.all()
        return Usuario.objects.filter(id=user.id)

class CustomLoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        update_last_login(None, user)
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'rol': user.rol
        })
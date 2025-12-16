from rest_framework import serializers
from .models import Usuario, Evento, Reserva

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombre', 'apellido', 'rol', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['username'] = validated_data.get('email')
        return Usuario.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        if 'email' in validated_data:
            validated_data['username'] = validated_data['email']

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

class EventoSerializer(serializers.ModelSerializer):
    cupos_disponibles = serializers.SerializerMethodField()

    class Meta:
        model = Evento
        fields = '__all__'

    def get_cupos_disponibles(self, obj):
        reservas = obj.reserva_set.filter(estado_reserva='confirmada')
        ocupados = sum(r.cantidad_plazas for r in reservas)
        return obj.capacidad - ocupados

    def validate(self, data):
        inicio = data.get('fecha_inicio')
        fin = data.get('fecha_fin')

        if self.instance:
            inicio = inicio or self.instance.fecha_inicio
            fin = fin or self.instance.fecha_fin

        if inicio and fin and fin < inicio:
            raise serializers.ValidationError({
                "fecha_fin": "La fecha de fin no puede ser anterior a la fecha de inicio"
            })

        return data

class ReservaSerializer(serializers.ModelSerializer):
    evento = serializers.PrimaryKeyRelatedField(queryset=Evento.objects.all())

    # Rut opcional: no obligatorio, acepta blank/null
    rut_contacto = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Reserva
        fields = [
            'id',
            'codigo_reserva',
            'evento',
            'cantidad_plazas',
            'estado_reserva',
            'fecha_reserva',
            # Campos para invitados
            'nombre_contacto',
            'email_contacto',
            'rut_contacto',
            # usuario (lo mostramos en la representación, pero lo mantenemos read-only)
            'usuario',
        ]
        read_only_fields = ['usuario', 'codigo_reserva', 'estado_reserva', 'fecha_reserva']

    def to_representation(self, instance):
        response = super().to_representation(instance)
        # Incluir datos anidados del evento
        response['evento'] = EventoSerializer(instance.evento).data
        # Manejar usuario nulo (invitado)
        response['usuario'] = instance.usuario.email if instance.usuario else None
        return response
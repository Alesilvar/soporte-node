const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configurar el cliente de DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient();
const SOPORTE_TABLE = process.env.SOPORTE_TABLE;

exports.handler = async (event) => {
    try {
        // Parsear el cuerpo de la solicitud
        const data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        const { usuario_id, ticket_id, Titulo, descripcion } = data;

        // Obtener el ítem actual de la solicitud
        const getParams = {
            TableName: SOPORTE_TABLE,
            Key: { usuario_id, ticket_id },
        };
        const getResult = await dynamodb.get(getParams).promise();

        // Verificar si la solicitud existe
        if (!getResult.Item) {
            return {
                statusCode: 404,
                body: { mensaje: 'Solicitud no encontrada' },
            };
        }

        // Obtener el estado actual de la solicitud
        const solicitudAnterior = getResult.Item; // Datos originales antes de modificar
        const estadoActual = solicitudAnterior.estado || 'pendiente';

        // Verificar si la solicitud ya ha sido respondida
        if (estadoActual === 'respondido') {
            return {
                statusCode: 400,
                body: {
                    mensaje: 'La solicitud ya fue respondida y no puede ser modificada.',
                    solicitud_anterior: {
                        Titulo: solicitudAnterior.Titulo || 'No disponible',
                        descripcion: solicitudAnterior.descripcion || 'No disponible',
                        respuesta: solicitudAnterior.respuesta || 'No disponible',
                    },
                },
            };
        }

        // Actualizar la solicitud si está en estado "pendiente"
        const fechaActualizacion = new Date().toISOString();

        const updateParams = {
            TableName: SOPORTE_TABLE,
            Key: { usuario_id, ticket_id },
            UpdateExpression: 'SET Titulo = :titulo, descripcion = :descripcion, fecha = :fecha',
            ExpressionAttributeValues: {
                ':titulo': Titulo,
                ':descripcion': descripcion,
                ':fecha': fechaActualizacion,
            },
        };
        await dynamodb.update(updateParams).promise();

        // Crear el JSON de la solicitud modificada
        const solicitudModificada = {
            momento: 'actual modificado',
            usuario_id,
            ticket_id,
            Titulo,
            descripcion,
            estado: 'pendiente',
            fecha: fechaActualizacion,
        };

        // Crear el JSON de la solicitud anterior
        const solicitudAnteriorJson = {
            momento: 'anterior',
            usuario_id: solicitudAnterior.usuario_id,
            ticket_id: solicitudAnterior.ticket_id,
            Titulo: solicitudAnterior.Titulo,
            descripcion: solicitudAnterior.descripcion,
            estado: solicitudAnterior.estado,
            fecha: solicitudAnterior.fecha,
        };

        // Retornar ambos JSON en la respuesta
        return {
            statusCode: 200,
            body: {
                solicitud_anterior: solicitudAnteriorJson,
                solicitud_modificada: solicitudModificada,
            },
        };

    } catch (error) {
        console.error(`Error: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify({ mensaje: 'Error interno del servidor', detalles: error.message }),
        };
    }
};

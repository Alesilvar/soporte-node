const AWS = require('aws-sdk');

// Configurar el cliente de DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'TABLA-SOPORTE'; // Cambia esto si usas una variable de entorno

exports.handler = async (event) => {
    try {
        // Parsear el cuerpo de la solicitud
        const data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        const { usuario_id, ticket_id } = data;

        // Validar los campos obligatorios
        if (!usuario_id || !ticket_id) {
            return {
                statusCode: 400,
                body: {
                    error: 'Solicitud inválida',
                    details: 'usuario_id y ticket_id son obligatorios',
                },
            };
        }

        // Verificar si la solicitud existe
        const getParams = {
            TableName: TABLE_NAME,
            Key: { usuario_id, ticket_id },
        };

        const result = await dynamodb.get(getParams).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: 'Solicitud no encontrada',
                    details: `No se encontró una solicitud con usuario_id ${usuario_id} y ticket_id ${ticket_id}`,
                }),
            };
        }

        // Eliminar la solicitud
        const deleteParams = {
            TableName: TABLE_NAME,
            Key: { usuario_id, ticket_id },
        };

        await dynamodb.delete(deleteParams).promise();

        // Responder con éxito
        return {
            statusCode: 200,
            body: {
                message: `Solicitud ${ticket_id} del usuario ${usuario_id} se eliminó correctamente`,
            },
        };
    } catch (error) {
        // Manejo de errores
        console.error(`Error: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Error interno del servidor',
                details: error.message,
            }),
        };
    }
};

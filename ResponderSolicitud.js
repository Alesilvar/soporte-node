const AWS = require('aws-sdk');

// Configurar el cliente de DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'TABLA-SOPORTE'; // Cambia esto si usas una variable de entorno

exports.handler = async (event) => {
    try {
        // Parsear el cuerpo de la solicitud
        const data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        const { usuario_id, ticket_id, response: responseText } = data;

        if (!usuario_id || !ticket_id || !responseText) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Campos 'usuario_id', 'ticket_id' y 'response' son requeridos." }),
            };
        }

        // Obtener el ítem actual de DynamoDB
        const getParams = {
            TableName: TABLE_NAME,
            Key: { usuario_id, ticket_id },
        };

        const result = await dynamodb.get(getParams).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Solicitud no encontrada.' }),
            };
        }

        // Verificar si la solicitud ya fue respondida
        if (result.Item.estado === 'respondido') {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'La solicitud ya fue respondida.' }),
            };
        }

        // Preparar la actualización
        const fechaRespuesta = new Date().toISOString();
        const updateParams = {
            TableName: TABLE_NAME,
            Key: { usuario_id, ticket_id },
            UpdateExpression: 'SET #resp = :responseText, estado = :estado, fecha_respuesta = :fecha',
            ExpressionAttributeNames: {
                '#resp': 'response', // Alias para evitar conflictos con palabras reservadas
            },
            ExpressionAttributeValues: {
                ':responseText': responseText,
                ':estado': 'respondido',
                ':fecha': fechaRespuesta,
            },
        };

        // Actualizar el ítem en DynamoDB
        await dynamodb.update(updateParams).promise();

        // Retornar la confirmación de la actualización
        return {
            statusCode: 200,
            body: {
                usuario_id,
                ticket_id,
                response: responseText,
                estado: 'respondido',
                fecha_respuesta: fechaRespuesta,
            },
        };
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error interno del servidor', details: error.message }),
        };
    }
};

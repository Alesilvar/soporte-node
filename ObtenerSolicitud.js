const AWS = require('aws-sdk');

// Configurar el cliente de DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'TABLA-SOPORTE'; // Cambia esto si usas una variable de entorno

exports.handler = async (event) => {
    try {
        // Parsear el cuerpo de la solicitud
        const data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        const { usuario_id, ticket_id } = data;

        if (!usuario_id || !ticket_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "'usuario_id' y 'ticket_id' son requeridos" }),
            };
        }

        // Obtener la solicitud desde DynamoDB
        const params = {
            TableName: TABLE_NAME,
            Key: { usuario_id, ticket_id },
        };

        const result = await dynamodb.get(params).promise();

        if (result.Item) {
            // Retornar la solicitud encontrada
            return {
                statusCode: 200,
                body: JSON.stringify(result.Item),
            };
        } else {
            // Retornar mensaje si no se encuentra
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Solicitud no encontrada' }),
            };
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error interno del servidor', details: error.message }),
        };
    }
};

const AWS = require('aws-sdk');

// Configurar el cliente de DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'TABLA-SOPORTE'; // Cambia esto si usas una variable de entorno

exports.handler = async (event) => {
    try {
        // Parsear el cuerpo del evento para obtener usuario_id
        const data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { usuario_id } = data;

        if (!usuario_id) {
            return {
                statusCode: 400,
                body: { message: "'usuario_id' es requerido" },
            };
        }

        // Realizar la consulta en DynamoDB
        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'usuario_id = :usuario_id',
            ExpressionAttributeValues: {
                ':usuario_id': usuario_id,
            },
        };

        const result = await dynamodb.query(params).promise();

        // Retornar todas las solicitudes asociadas al usuario
        return {
            statusCode: 200,
            body: result.Items, // Convertir el resultado a JSON
        };
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error interno del servidor', details: error.message }),
        };
    }
};

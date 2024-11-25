const AWS = require('aws-sdk');

// Configurar el cliente de DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'TABLA-SOPORTE'; // Cambia esto si usas una variable de entorno para el nombre de la tabla

exports.handler = async (event) => {
    try {
        // Escaneo completo de la tabla en DynamoDB
        const params = {
            TableName: TABLE_NAME,
        };
        const result = await dynamodb.scan(params).promise();

        // Retornar la lista de solicitudes
        return {
            statusCode: 200,
            body: JSON.stringify(result.Items), // Convertir a JSON
        };
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify({ mensaje: 'Error interno del servidor', detalles: error.message }),
        };
    }
};

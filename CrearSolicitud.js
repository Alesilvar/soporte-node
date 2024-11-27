const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configurar el cliente de DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'TABLA-SOPORTE';

exports.handler = async (event) => {
    try {
        // Parsear el cuerpo de la solicitud
        const data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        // Validar campos requeridos
        if (!data.usuario_id || !data.Titulo || !data.descripcion) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Campos 'usuario_id', 'Titulo' y 'descripcion' son obligatorios"
                }),
            };
        }

        // Extraer datos del cuerpo
        const usuario_id = data.usuario_id;
        const titulo = data.Titulo;
        const descripcion = data.descripcion;

        // Generar ticket ID y fecha
        const ticket_id = uuidv4();
        const fecha = new Date().toISOString();

        // Crear el objeto a insertar en DynamoDB
        const item = {
            usuario_id,
            ticket_id,
            Titulo: titulo,
            descripcion,
            estado: 'pendiente',
            fecha,
        };

        // Insertar el item en DynamoDB
        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: item,
        }).promise();

        // Respuesta de éxito
        return {
            statusCode: 200,
            body: {
                message: "Solicitud de soporte creada correctamente",
                data: item,
            },
        };

    } catch (error) {
        // Respuesta de error
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Error interno del servidor",
                details: error.message,
            }),
        };
    }
};

const AWS = require("aws-sdk");
const { v4 } = require("uuid");

const HEROES_TABLE = process.env.HEROES_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

// Get all heroes
const getHeroes = async (req, res) => {

    try {

        const heores = await dynamoDbClient.scan({
            TableName: HEROES_TABLE,
        }).promise();
        
        return res.status(200).json({
            success: true,
            message: "All heroes obtained",
            body: heores.Items
        });

    } catch (error) {

        console.log(error);

        return {
            statusCode: 500,
            message: "Heroes could not be retrieved",
            body: {
                err: error
            }
        };

    }

};

// Create hero
const createHero = async (req, res) => {

    try {

        const hero = req.body;
        const id = v4();

        const data = {
            TableName: HEROES_TABLE,
            Item: {
                id,
                ...hero
            },
        };

        await dynamoDbClient.put(data).promise();

        return res.status(200).json({
            success: true,
            message: "The hero has been created successfully",
            body: data.Item
        });

    } catch (error) {

        console.log(error);

        return {
            statusCode: 500,
            message: "Could not create hero",
            body: {
                err: error
            }
        };

    }

};

// Get hero by ID
const getHero = async (req, res) => {

    try {

        const id = req.params.id;

        const params = {
            TableName: HEROES_TABLE,
            Key: { id }
        };

        const hero = await dynamoDbClient.get(params).promise();
        
        if (hero.Item)
            return res.status(200).json({
                success: true,
                message: "Hero obtained",
                body: hero.Item
            });
        else
            return res.status(404).json({
                success: false,
                message: "Unobtained hero",
                body: {
                    err: "Could not find hero with provided id: " + id
                }
            });

    } catch (error) {

        console.log(error);

        return {
            statusCode: 500,
            message: "Could not retreive hero",
            body: {
                err: error
            }
        };

    }

};

// Update hero by ID
const updateHero = async (req, res) => {

    try {

        const id   = req.params.id;
        const hero = req.body;

        const Oldhero = await dynamoDbClient.get({ TableName: HEROES_TABLE, Key: { id } }).promise();

        if (!Oldhero.Item)
            return res.status(404).json({
                success: false,
                message: "Unobtained hero",
                body: {
                    err: "Could not find hero with provided id: " + id
                }
            });

        let UpdateExpression          = 'set';
        let ExpressionAttributeNames  = {};
        let ExpressionAttributeValues = {};

        for (const element in hero) {
            UpdateExpression += ` #${element} = :${element} ,`;
            ExpressionAttributeNames['#' + element] = element;
            ExpressionAttributeValues[':' + element] = hero[element];
        }

        UpdateExpression = UpdateExpression.slice(0, -1);

        const data = {
            TableName: HEROES_TABLE,
            Key: { id },
            UpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        const heroUpdated = await dynamoDbClient.update(data).promise();

        return res.status(200).json({
            success: true,
            message: "The hero has been successfully upgraded",
            body: heroUpdated
        });

    } catch (error) {

        console.log(error);

        return {
            statusCode: 500,
            message: "Could not update hero",
            body: {
                err: error
            }
        };

    }

};

// Delete hero by ID
const deleteHero = async (req, res) => {

    try {

        const id = req.params.id;

        const data = {
            TableName: HEROES_TABLE,
            Key: { id }
        };

        const Oldhero = await dynamoDbClient.get(data).promise();

        if (!Oldhero.Item)
            return res.status(404).json({
                success: false,
                message: "Unobtained hero",
                body: {
                    err: "Could not find hero with provided id: " + id
                }
            });

        await dynamoDbClient.delete(data).promise();

        return res.status(200).json({
            success: true,
            message: "The hero has been successfully eliminated",
            body: {
                id,
                removed: true
            }
        });

    } catch (error) {

        console.log(error);

        return {
            statusCode: 500,
            message: "Could not remove hero",
            body: {
                err: error
            }
        };

    }

};

module.exports = {
    getHeroes,
    createHero,
    getHero,
    updateHero,
    deleteHero
};
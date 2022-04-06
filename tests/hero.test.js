const request = require('supertest');

const heroController = require('../controllers/hero.controller');

const { DocumentClient } = require('aws-sdk/clients/dynamodb');

const isTest = process.env.JEST_WORKER_ID;
const config = {
    convertEmptyValues: true,
    ...(isTest && {
        endpoint: 'localhost:8000',
        sslEnabled: false,
        region: 'local-env',
    }),
};

const ddb = new DocumentClient(config);


describe('heroController', () => {

    describe("HEROES", () => {
        
        test("GET getHeroes", async () => {
            
            await ddb.put({ TableName: 'HeroesTable', Item: { id: '1', name: 'hero' } }).promise();

            const heroes = await ddb.scan({ TableName: 'HeroesTable' }).promise();

            await heroController.getHeroes();

            expect(heroes.Items).toEqual([{
                id: '1',
                name: 'hero',
            }]);
            
        });

        test("POST createHero", async () => {

            const hero = await ddb.put({ TableName: 'HeroesTable', Item: { id: '1', name: 'hero' } }).promise();

            await heroController.createHero();

            expect(hero).toEqual({});

        });
        
        test("GET getHero", async () => {

            const { Item } = await ddb.get({ TableName: 'HeroesTable', Key: { id: '1' } }).promise();

            await heroController.getHero();

            expect(Item).toEqual({
                id: '1',
                name: 'hero',
            });

        });
        
        test("PUT updateHero", async () => {

            await ddb.update({
                TableName: 'HeroesTable', Key: { id: '1' }, UpdateExpression: "set alias = :name",
                ExpressionAttributeValues: {
                    ":name": "hero 2",
                }, ReturnValues: 'ALL_NEW' }).promise();

            const { Item } = await ddb.get({ TableName: 'HeroesTable', Key: { id: '1' } }).promise();

            await heroController.updateHero();

            expect(Item).toEqual({
                id: '1',
                alias: 'hero 2',
                name: "hero"
            });

        });
        
        test("DELETE deleteHero", async () => {

            const hero = await ddb.delete({ TableName: 'HeroesTable', Key: { id: '1' } }).promise();

            await heroController.deleteHero();

            expect(hero).toEqual({});

        });

    })

});
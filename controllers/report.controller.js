const AWS = require("aws-sdk");
const { Parser } = require('json2csv');
const PDFDocument = require("pdfkit-table");

const HEROES_TABLE   = process.env.HEROES_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

// Export Excel
const heroesExcel = async (req, res) => {

    try {

        const heroes = await dynamoDbClient.scan({
            TableName: HEROES_TABLE,
        }).promise();

        const fields = ['name', 'alias', 'species', 'company.name', 'company.team'];
        const opts = { fields };

        const parser = new Parser(opts);
        const csv = parser.parse(heroes.Items);

        res.setHeader('content-type', 'text/csv');
        return res.status(200).send(csv);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Heroes could not be retrieved",
            body: {
                err: error
            }
        });

    }

};

// Export PDF
const heroesPdf = async (req, res) => {

    try {

        const PDF = await new Promise(resolve => {

            const doc = new PDFDocument();

            dynamoDbClient.scan({ TableName: HEROES_TABLE }, (error, result) => {

                let data = [];

                result.Items.forEach(item => {
                    data.push([item.name, item.alias, item.species, item.company.name, item.company.team])
                });

                const table = {
                    title: "Heroes",
                    headers: ['Name', 'Alias', 'Species', 'Company Name', 'Company Team'],
                    rows: data,
                };

                doc.table(table, { width: 500, });

                const buffers = [];

                doc.on("data", buffers.push.bind(buffers));
                doc.on("end", () => {
                    const pdf = Buffer.concat(buffers);

                    const response = pdf;

                    resolve(response);
                });

                doc.end();

            });

        });

        res.setHeader('Content-Disposition', 'inline;filename=Heroes.pdf')
        res.setHeader('content-type', 'application/pdf');
        return res.status(200).send(PDF);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Heroes could not be retrieved",
            body: {
                err: error
            }
        });

    }

};

module.exports = {
    heroesExcel,
    heroesPdf
};
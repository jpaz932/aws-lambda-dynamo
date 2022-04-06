const AWS = require("aws-sdk");
const { Parser } = require('json2csv');
const PdfPrinter = require('pdfmake');

const s3 = new AWS.S3();
const HEROES_TABLE   = process.env.HEROES_TABLE;
const HEROES_BUCKET  = process.env.HEROES_BUCKET;
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

        const heroes = await dynamoDbClient.scan({
            TableName: HEROES_TABLE,
        }).promise();

        let data = [
            ['Name', 'Alias', 'Species', 'Company Name', 'Company Team']
        ]

        heroes.Items.forEach(hero => {
            data.push([hero.name, hero.alias, hero.species, hero.company.name, hero.company.team])
        });

        const fonts = {
            Roboto: {
                normal: 'fonts/Roboto-Regular.ttf',
                bold: 'fonts/Roboto-Medium.ttf',
                italics: 'fonts/Roboto-Italic.ttf',
                bolditalics: 'fonts/Roboto-MediumItalic.ttf'
            }
        };

        let printer = new PdfPrinter(fonts);

        let docDefinition = {
            content: [
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        body: data
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
                        }
                    }
                },
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 13,
                    color: 'black'
                }
            }
        }

        var PDF = printer.createPdfKitDocument(docDefinition);

        let chunks = [];

        PDF.on('data', chunk => chunks.push(chunk));
        PDF.on('end', async function () {

            const params = {
                Bucket: HEROES_BUCKET,
                Key: 'heroes.pdf',
                Body: Buffer.concat(chunks)
            };

            await s3.putObject(params, async (err) => {
                console.log("subir file---------")
                if (err) {
                    console.log(err)
                    return res.send({
                        statusCode: 400,
                        body: JSON.stringify({ error: err }),
                    });
                }
            }).promise();
        });

        PDF.end();

        const url = await new Promise((resolve, reject) => {
            s3.getSignedUrl('getObject', {
                Bucket: HEROES_BUCKET,
                Key: 'heroes.pdf',
                Expires: 300
            }, (err, url) => {
                err ? reject(err) : resolve(url);
            });
        });

        return res.status(200).send(url);

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
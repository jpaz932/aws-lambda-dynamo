const AWS = require("aws-sdk");
const excel = require('node-excel-export');

const PDFKit = require('pdfkit');

const HEROES_TABLE = process.env.HEROES_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

// Export Excel
const heroesExcel = async (req, res) => {

    try {

        const styles = {
            headerDark: {
                fill: {
                    fgColor: {
                        rgb: 'FF000000'
                    }
                },
                font: {
                    color: {
                        rgb: 'FFFFFFFF'
                    },
                    sz: 14,
                    bold: true,
                    underline: true
                }
            }
        };

        const specification = {
            name: {
                displayName: 'Name', 
                headerStyle: styles.headerDark,
                width: 80
            },
            alias: {
                displayName: 'Alias',
                headerStyle: styles.headerDark,
                width: 80
            },
            species: {
                displayName: 'Species',
                headerStyle: styles.headerDark,
                width: 80
            },
            company: {
                displayName: 'Company_name',
                headerStyle: styles.headerDark,
                cellFormat: function (value, row) {
                    return value.name;
                },
                width: 80
            },
            company: {
                displayName: 'Company_team',
                headerStyle: styles.headerDark,
                cellFormat: function (value, row) {
                    return value.team;
                },
                width: 80
            }
        }

        const heores = await dynamoDbClient.scan({
            TableName: HEROES_TABLE,
        }).promise();

        const report = excel.buildExport(
            [
                {
                    name: 'Heroes',
                    specification: specification,
                    data: heores.Items
                }
            ]
        );

        res.attachment('heroes.xlsx'); 
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");
        return res.send(report);

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

        // const heores = await dynamoDbClient.scan({
        //     TableName: HEROES_TABLE,
        // }).promise();

        const text =  'Hello world';

        const doc = new PDFKit()

        doc.text(text)

        const buffers = []
        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => {
            const pdf = Buffer.concat(buffers)
            const response = {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/pdf",
                },
                body: pdf.toString("base64"),
                isBase64Encoded: true,
            }
            return res.send(response);
        })

        doc.end()


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
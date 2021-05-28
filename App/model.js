const bodyParser = require("body-parser");
const express = require("express");
const fileUpload = require('express-fileupload');
const TimeSeries = require('./timeseries');
const simpleAnomalyDetector = require('./SimpleAnomalyDetector.js');
const HybridAnomalyDetector = require('./HybridAnomalyDetector.js');
const csvParser = require("./csvParser");
const app = express();
const jsonToString = require('./jsonToString');

app.use(fileUpload()); // Don't forget this line!

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("../View"));

app.get('/', (req, res) => {
    res.sendFile('/index.html')
})


app.route("/detect")
    .post(function(req,res){
        const model_type = req.body.model_type;
        console.log(req.files.train_data);
        // const trainFile = jsonToString.parseJSON(req.files.train_data)
        // const testFile = jsonToString.parseJSON(req.files.test_data.data)
        const trainFile = req.files.train_data.data.toString();
        const testFile = req.files.test_data.data.toString();
        const trainFileJSON = JSON.stringify(csvParser.parseCsv(trainFile))
        const testFileJSON = JSON.stringify(csvParser.parseCsv(testFile))

        let ts = new TimeSeries(trainFileJSON)
        let ts2 = new TimeSeries(testFileJSON)
        let anomalyDetector = null;
        let flag = 0

        if (model_type === "reg"){
            anomalyDetector = new simpleAnomalyDetector.SimpleAnomalyDetector()

        }
        else if(model_type === "hybrid"){
            anomalyDetector = new HybridAnomalyDetector.HybridAnomalyDetector()
        }
        else{
            res.send("No anomaly detector of that type")
            flag = 1
        }

        if(flag === 0){
            anomalyDetector.learnNormal(ts)
            let x = anomalyDetector.detect(ts2)
            console.log(x);
            res.send(x)
        }
    });

app.listen(8080, function() {
    console.log("Server starts on port 8080")
});


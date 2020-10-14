const svg = d3.select('#plot');

// Grab the width and height components from the SVG element in HTML
const width = parseFloat(svg.attr('width'));
const height = parseFloat(svg.attr('height'));


// Data Generation Functions

// Generate random number between min and max
const randomNum = (min, max) => {
    return Math.random() * (max - min) + min;
}

// Generate an array of 100 1-dimensional datapoints each with a corresponding y-value
// A small random value is added to each to generate a small amount of noise, spreading the data points
const generateData = () => {
    let xArr = [];
    for (let i = 0; i < 100; ++i) xArr[i] = randomNum(-2.5, 2.5);

    let yArr = [];
    let i = 0;
    let randW = randomNum(-1, 1);
    xArr.forEach( d => {
        yArr[i] = randW * d + randomNum(-0.5, 0.5);
        ++i;

    
    mainArr = []
    for (let j = 0; j < 100; ++j){
        mainArr[j] = {};
    }
    let j = 0;
    mainArr.forEach( d => {
        d.x = +xArr[j];
        d.y = +yArr[j];
        ++j;
    })
    })

    return [mainArr, xArr, yArr];
}


var [data, X, Y] = generateData();

// Render function used for producing the scatter plot of each data points and a line of best fit for the model
const render = (data, bestFit) => {

    // Variables used for controlling properties of the plot
    const xValue = d => d.x;
    const yValue = d => d.y;
    const margin = {top: 20, bottom: 60, left: 50, right: 20}
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const circleRadius = 5;
    const xLabel = "x";
    const yLabel = 'y';
    const title = ""

    // Linear scaling along the x-axis according to the population number
    // requires the data domain of the data point, with range setting the max-min values
    const xScale = d3.scaleLinear()
        .domain([-2.5, 2.5])
        .range([0, innerWidth])
        .nice();

    // Used for displaying ordinal attributes, in this case seperates each bar in the plot
    // Domain maps each country (ordinal) from dataset, with range setting the maximum dimensions according to SVG element
    const yScale = d3.scaleLinear()
        .domain([2.5, -2.5])
        .range([0, innerHeight])
        .nice();
    
    // Axis customisation
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const yAxis = d3.axisLeft(yScale)
        .tickSize(-innerWidth)

    const xAxisTickFormat = number => d3.format('.3')(number);
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(xAxisTickFormat)
        .tickSize(-innerHeight)
        .tickPadding(10);

    const xAxisG = g.append('g')
        .call(xAxis)
        .attr('transform', `translate(${0}, ${innerHeight})`)
    xAxisG.selectAll('.domain').remove();

    const yAxisG = g.append('g')
        .call(yAxis);
    yAxisG.selectAll('.domain').remove();

    xAxisG.append('text')
        .attr('class', 'axis_label')
        .attr('fill', 'black')
        .attr('x', innerWidth/2)
        .attr('y', 35)
        .attr('font-size', '2em')
        .text(xLabel);

    yAxisG.append('text')
        .attr('class', 'axis_label')
        .attr('fill', 'black')
        .attr('x', -innerHeight /2)
        .attr('y', -30)
        .attr('font-size', '2em')
        .attr('text-anchor', 'middle')
        .attr('transform', "rotate(-90)")
        .text(yLabel);

    // Creates circles for each datapoint, with dimensions according to the above mentioned scalings
    // sets position according to the scaling values described above
    g.selectAll('circle').data(data)
        .enter().append('circle')
            .attr('cy', d => yScale(yValue(d))) 
            .attr('cx', d => xScale(xValue(d)))
            .attr('r', circleRadius)
            .attr('opacity', 0.7)
            .attr('fill', 'steelblue')

    // Adding a title is as simple as appending a text element
    g.append('text')
        .attr('x', innerWidth/2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .text(title)
    
    // If we pass an array consisting of the predicted values the function will produce a line of best fit according to these
    // Otherwise, in cases where this is not required such as on initisalisation, an empty array is passed instead omitting this 
    // through the if condition below.
    if (bestFit.length > 0) {

        const lineGenerator = d3.line()
            .x(d => xScale(xValue(d)))
            .y(d => yScale(yValue(d)))
            .curve(d3.curveBasis);

        g.append('path')
            .attr('d', lineGenerator(bestFit))
            .attr('fill', 'none')
            .attr('stroke', 'maroon')
            .attr('stroke-width', '2px')
            .attr('stroke-linejoin', 'round')
    }
};

render(data, []);

// Sliders Options
let sliderLeft = document.getElementById("sliderL");
let sliderMid = document.getElementById("sliderM");
let sliderRight = document.getElementById("sliderR");

let lr = +sliderLeft.value;
let training_steps = +sliderMid.value;
let batch_size = +sliderRight.value;

document.getElementById("outputLeft").innerHTML = sliderLeft.value;
document.getElementById("outputMid").innerHTML = sliderMid.value;
document.getElementById("outputRight").innerHTML = sliderRight.value;

sliderLeft.oninput = () => {
    document.getElementById("outputLeft").innerHTML = sliderLeft.value;
    lr = +sliderLeft.value;
;
  }

sliderMid.oninput = () => {
    document.getElementById("outputMid").innerHTML = sliderMid.value;
    training_steps = +sliderMid.value;
  }

sliderRight.oninput = () => {
    document.getElementById("outputRight").innerHTML = sliderRight.value;
    batch_size = +sliderRight.value;
  }

// Reload Dataset Button
let reload = document.getElementById("reloadButton");

let loss = "N/A";
let epoch = 0;
let iter = 0;

// On clicking the button, a new dataset is generated and the plot re-renders.
reloadButton.onclick = () => {
    d3.selectAll("#plot > *").remove();
    const values = generateData();
    data = values[0];
    X = values[1];
    Y = values[2];
    render(data, []);

    return [data, X, Y];
  }

// A simple sleep function used for slowing down the iterations during training in an attempt to provide a 
// more effective visualisation.
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

// Linear Regression Model built in TensorFlow.js

// A function to re-render the line of best fit at each iteration, displaying the update.
const snapRender = (model) => {
    let y = []
    y[0] = +model.predict(tf.tensor2d([-2.4], [1, 1])).dataSync()[0]
    y[1] = +model.predict(tf.tensor2d([2.4], [1, 1])).dataSync()[0]

    const bestFit = [{"x": -2.4}, {"x": 2.4}]
    let i = 0;
    bestFit.forEach( d => {
        d.x = +d.x
        d.y = y[i]
        ++i
    })
    d3.selectAll("#plot > *").remove();
    
    sleep(100);

    render(data, bestFit);
}

// Asynchronous Training Function
async function trainModel(inputs, labels, lr, batch_size, epochs) {
    
    // Building the model
    const model = tf.sequential();
    
    // Input Layer
    model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: false}));
  
    // Output Layer
    model.add(tf.layers.dense({units: 1, useBias: true}));

    snapRender(model);
    
    // Model is trained using SGD and MSE
    model.compile({
        optimizer: tf.train.sgd(lr),
        loss: 'meanSquaredError',
    });

    const batchSize = batch_size;
    const numEpochs = epochs;

    return await model.fit(inputs, labels, {
        batchSize: batchSize,
        epochs: numEpochs,
        shuffle: true,
        callbacks: {
            onBatchEnd: async (epoch, logs) => {
                let y = [];
                y[0] = +model.predict(tf.tensor2d([-2.4], [1, 1])).dataSync()[0];
                y[1] = +model.predict(tf.tensor2d([2.4], [1, 1])).dataSync()[0];

                const bestFit = [{"x": -2.4}, {"x": 2.4}];
                let i = 0;
                bestFit.forEach( d => {
                    d.x = +d.x
                    d.y = y[i]
                    ++i
                })
                d3.selectAll("#plot > *").remove();
                
                sleep(100);

                render(data, bestFit);
                
                loss = logs.loss;
                iter++;
                epoch_ = iter / (100 / batchSize);
                
                document.getElementById("outputLoss").innerHTML = Number( loss.toPrecision(2) );
                document.getElementById("outputIteration").innerHTML = iter;
                document.getElementById("outputEpoch").innerHTML = epoch_;


              }
        },
    });
}

// Train button, used to trigger the training loop
let trainButton = document.getElementById("startButton")

trainButton.onclick = () => {
    const xTensor = tf.tensor2d(X, [X.length, 1]);
    const yTensor = tf.tensor2d(Y, [Y.length, 1]);
    iter = 0;
    trainModel(xTensor, yTensor, lr, batch_size, training_steps);
  }

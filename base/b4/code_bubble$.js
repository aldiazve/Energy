'use strict'
/**
 * @file Base chart
 * @author Daniel Santos <dfsantosbu@unal.edu.co>
 * @version 1
 */

/*
 @Constants: Setup variable
*/
let height = 450
let width = height // restriction for being circles
let len = 0
let x0 = 65
let y0 = 20
let home = 1
let maxValue = 1500
let minX = 0
let margin = {
 top: 20,
 right: 40,
 bottom: 40,
 left: 300
};

/*
 @Constants for legends
*/
let legendRectSize = 18
let legendSpacing = 4
let color = d3.scaleOrdinal(d3.schemeCategory20b);
let customColors = [
  "#A6A6A6",
  "#595959"
]
let labelsLegends = [{
   label: 'Your household'
 },
 {
   label: 'Other households'
 }
];

let elements = []
let iradios = []
let radius = 42
let radiusb = 13
let delta = 0

let xscale = d3.scaleLinear()
 .domain([0, maxValue])
 .range([0, width]); //actual length of axis

let yscale = d3.scaleLinear()
 .domain([0, maxValue])
 .range([height, 0]) //actual length of axis

function getRadius(r) {
 return radiusb
}
function getX(e, r) {
  //console.log(elements[r]["x"], elements[r]["x"])
 return xscale(elements[r]["x"]) -xscale(minX) +x0+radius
}
function getY(e, r) {
 //  let res = (maxValue - elements[r][1] ) /(maxValue/height) + y0
 return yscale(elements[r]["y"]) + y0
}

function getValue(e, r) {
  return e
 }
function getColor(d, i) {
 if (elements[i]["name"] == "House"+home) return customColors[0]
 return customColors[1]
}

/*
  Get basket
*/
function getBask(n){
  let bask = parseFloat(n) / maxValue * 10.0
  return parseInt(bask)
}

/*
  Function to check if two circles collide
*/
function collide(circles, x, y){
  let n = circles.length
  for(let i = 0; i<n ; i++){
    let c = circles[i]
    if( c["x"] == 0 && c["y"]==0 ) continue
    if( Math.pow(c["x"]-x,2) + Math.pow(c["y"]-y,2) < Math.pow(2*radius,2) ) return true
  }
  return false
}

function sortFunction(a,b){
  if (a[1] === b[1]) {
    return 0;
  }
  return (a[1] < b[1]) ? -1 : 1;
}




/*
  Function to rotate a point(nx,ny) a grades
*/
function rotate(nx, ny , a, centerx, centery){
  let x = nx, y =ny
  let t = a* Math.PI / 180.0
  nx = centerx+ (x-centerx) * Math.cos(t) - (y-centery) * Math.sin(t)
  ny = centery+ (x-centerx) * Math.sin(t) + (y-centery) * Math.cos(t)
  return [nx, ny]
}

/*
 Logic to generate the locations
*/
function generate(dataset, baskets){
  elements = []
  let cont = 0, posx =0, posy =0
  let n = dataset.length
  console.log(dataset)
  elements.push({"radius":radius, "x":maxValue/2-200, "y":maxValue/2, "name":dataset[0][0],  "value":dataset[0][1]})
  for( let i=1; i<n ; ++i){
    let step = 0
    let flag = true
    for (let j=0; j<elements.length && flag; j++){
      let auxCircle = elements[j]
      posy = auxCircle["y"]
      posx = auxCircle["x"]+radius*2
      for(let k=0; k<360 && flag; k+=1){
        let aux = rotate(posx,posy, k, auxCircle["x"],auxCircle["y"])
        if(!collide(elements, aux[0], aux[1])){
          elements.push({"radius":radius, "x":aux[0], "y":aux[1], "name":dataset[i][0], "value":dataset[i][1]})
          flag = false
        }
      }
    }
  }
  return elements
}

/*
  Paint the circles
*/

function paint(nameDiv){
  let ibody = d3.select("#"+nameDiv)
  let isvg = ibody.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.left + margin.right)
    .attr("transform", "translate(" + (margin.left+35) + "," + margin.top + ")")
  //                  .style("border", "1px solid black")

  let x_axis = d3.axisBottom()
    .scale(xscale)
    .ticks(0)

  let y_axis = d3.axisLeft()
      .scale(yscale)
      .ticks(0)


  let icircles = isvg.selectAll("g")
    .data(iradios)
    .enter()
    .append("g")

  isvg.append("g")
    .attr("transform", "translate(" + x0 + ", " + y0 + ")")
    .call(y_axis);

  isvg.append("g")
    .attr("transform", "translate(" + x0 + ", " + (height + y0) + ")")
    .style("stroke-dasharray", ("10, 10"))
    .call(x_axis)

  //Add atributtes circles
  let iattr = icircles.append("circle")
    .attr("cx", getX)
    .attr("cy", getY)
    .attr("r", getRadius)
    .style("fill", getColor)

  let legend = isvg.selectAll('.legend')
    .data(labelsLegends)
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function (d, i) {
      let h = legendRectSize + legendSpacing;
      let offset = h * color.domain().length / 2;
      let horz = i * 7 * h - offset + width / 4 +40*i+15
      let vert = (height + y0 + 50)
      return 'translate(' + horz + ',' + vert + ')';
    });

    legend.append('circle')
      .attr('r', 10)
      .style('fill', function (d, i) {
        return customColors[i];
      })
      //.style('stroke', "black");

    legend.append('text')
      .attr('x', legendRectSize + legendSpacing )
      .attr('y', legendRectSize - legendSpacing -8)
      .text(function (d) {
        return d.label;
      });

    
      icircles.append("text")
      .attr("x", function(d,i){
       return getX(1, i)
      })
      .attr("y", function(d,i){
       return getY(1, i)
      })
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(function(d,i){
        let txt = elements[i]["value"]
        return txt
      })
      
  
}




class Bubble {
  constructor(file){
    this.file = file
  }
  plot(nameDiv, myhome, flag=true){
    // utilitary function
    document.getElementById(nameDiv).innerHTML = ""
    const arrayColumn = (arr, n) => arr.map(x => x[n])
    home = myhome
    if(flag){
      d3.csv(this.file, function (data) {
        let dataset = []
        let basket = new Map()
        for (let e in data) {
          let info = data[e]
          let name = info["name"]
          let value = parseInt(info["y"])
          if(name){
            dataset.push([name, value])
            let x = getBask(value)
            if(!basket.has(x)){
              basket.set(x, [0,0])
            }else{
              basket.set(x, [basket.get(x)[0]+1,0])
            }
          }
        }
        dataset.sort(sortFunction)
        elements = generate(dataset, basket)
        len =  elements.length
        iradios = arrayColumn(elements, "radius")
        paint(nameDiv)
      })
    }else{
      let dataset = []
      let data = this.file
      let basket = new Map()
      for (let e in data) {
        let info = data[e]
        let name = info["name"]
        let value = parseInt(info["y"])
        if(name){
          dataset.push([name, value])
          let x = getBask(value)
          if(!basket.has(x)){
            basket.set(x, [0,0])
          }else{
            basket.set(x, [basket.get(x)[0]+1,0])
          }
        }
      }
      //  radius = 62//Math.min(yscale(15), parseInt(26*60/dataset.length))
     //  dataset = shuffleArray(dataset)
     dataset.sort(sortFunction)
      elements = generate(dataset, basket)
      len =  elements.length
      iradios = arrayColumn(elements, "radius")
      paint(nameDiv)
    }
  }
}

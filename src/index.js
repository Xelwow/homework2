import "babel-polyfill";
import Chart from "chart.js";


//const currencyURL = "www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

async function loadCurrency() {
  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const currencyData = parser.parseFromString(xmlTest, "text/xml");
  //<FORECAST day="19" month="04" year="2019" hour="21" tod="3" predict="0" weekday="6">
  //   <PHENOMENA cloudiness="1" precipitation="10" rpower="0" spower="0"/>
  //   <PRESSURE max="767" min="767"/>
  //   <TEMPERATURE max="9" min="1"/>
  //   <WIND min="1" max="3" direction="0"/>
  //   <RELWET max="57" min="32"/>
  //   <HEAT min="-4" max="-4"/>
  //</FORECAST>
  const forecasts = currencyData.querySelectorAll("FORECAST[day][month][year][hour]");
  const temps = currencyData.querySelectorAll("TEMPERATURE[max]");
  const heats = currencyData.querySelectorAll("HEAT[max]");
  const result = [];
  
  for(let i = 0; i < forecasts.length; i++){
    const day = forecasts.item(i).getAttribute("day");
    const month = forecasts.item(i).getAttribute("month");
    const year = forecasts.item(i).getAttribute("year");
    const hour = forecasts.item(i).getAttribute("hour");
    const time = hour + ":00 " + day + "." + month + "." + year;
    const temp = temps.item(i).getAttribute("max");
    const heat = heats.item(i).getAttribute("max");
    //console.log(time + " | " + temp + " | " + heat);

    result[i] = { time, temp, heat };
  }
  return result;
}

function normalizeDataByAttribute(data, attribute) {
  
  const result = [];
  //console.log(data);
  for(const key of Object.keys(data)){
    result[key] = data[key][attribute];
  }
  
  return result;
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function() {
  const responseData = await loadCurrency();
  const tempData = normalizeDataByAttribute(responseData, "temp");
  const heatData = normalizeDataByAttribute(responseData, "heat");
  const keys = normalizeDataByAttribute(responseData, "time");
  console.log(keys);
  const chartConfig = {
    type: "line",

    data: {
      labels: keys,
      datasets: [
        {
          label: "Температура",
          backgroundColor: "rgb(255, 20, 20)",
          borderColor: "rgb(180, 0, 0)",
          data: tempData
        },
        {
          label: "Ощущаемая температура",
          backgroundColor: "rgb(49, 166, 224)",
          borderColor: "rgb(8, 84, 122)",
          data: heatData
        }
      ]
    }
  };

  if (window.chart) {
    chart.data.labels = chartConfig.data.labels;
    chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    chart.update({
      duration: 800,
      easing: "easeOutBounce"
    });
  } else {
    window.chart = new Chart(canvasCtx, chartConfig);
  }
});

// function compare(a, b) {
//   if (a > b) return 1;
//   if (a < b) return -1;
//   return 0;
// }
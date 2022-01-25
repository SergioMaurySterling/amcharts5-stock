am5.ready(function() {

// Create root element
// https://www.amcharts.com/docs/v5/getting-started/#Root_element
var root = am5.Root.new("chartutilizationpeople");


// Set themes
// https://www.amcharts.com/docs/v5/concepts/themes/
root.setThemes([
  am5themes_Animated.new(root)
]);


// Create chart
// https://www.amcharts.com/docs/v5/charts/xy-chart/
var chart = root.container.children.push(am5xy.XYChart.new(root, {
  panX: true,
  panY: false,
  wheelX: "panX",
  wheelY: "zoomX",
  layout: root.verticalLayout
}));

chart.get("colors").set("step", 2);


// Create axes
// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
// when axes are in opposite side, they should be added in reverse order

// volume series axes
var xRenderer = am5xy.AxisRendererX.new(root, {});
    xRenderer.grid.template.set("visible", false);

    var peopleAxes = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
            paddingTop: 20,
            categoryField: "name",
            renderer: xRenderer
        })
    );


    var yRenderer = am5xy.AxisRendererY.new(root, {
      opposite: true
    });
    yRenderer.grid.template.set("strokeDasharray", [3]);

    var yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
            min: 0,
            renderer: yRenderer,
            height: am5.percent(30),
            layer: 5
        })
    );

// line series axes
var valueAxisRenderer = am5xy.AxisRendererY.new(root, {
  opposite: true,
  pan: "zoom"
});
valueAxisRenderer.labels.template.setAll({
  centerY: am5.percent(100),
  maxPosition: 0.98
});
var valueAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
  renderer: valueAxisRenderer,
  height: am5.percent(70),
  maxDeviation: 1
}));
valueAxis.axisHeader.children.push(am5.Label.new(root, {
  text: "Value",
  fontWeight: "bold",
  paddingBottom: 5,
  paddingTop: 5
}));

//date axes
var dateAxisRenderer = am5xy.AxisRendererX.new(root, {
  pan: "zoom"
});
dateAxisRenderer.labels.template.setAll({
  minPosition: 0.01,
  maxPosition: 0.99
});
var dateAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
  groupData: true,
  maxDeviation:0.5,
  baseInterval: {
    timeUnit: "day",
    count: 1
  },
  renderer: dateAxisRenderer
}));
dateAxis.set("tooltip", am5.Tooltip.new(root, {}));


// Add series
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/

// line series
var valueSeries1 = chart.series.push(am5xy.LineSeries.new(root, {
  valueYField: "price1",
  calculateAggregates: true,
  valueXField: "date",
  xAxis: dateAxis,
  yAxis: valueAxis,
  legendValueText: "{valueY}"
}));

valueSeries1.bullets.push(function () {
  return am5.Bullet.new(root, {
      locationY: 0,
      sprite: am5.Circle.new(root, {
          radius: 4,
          stroke: am5.color(0x00FF91),
          strokeWidth: 2,
          fill: am5.color(0x00FF91),
      })
  });
});

valueSeries1.fills.template.set("fillGradient", am5.LinearGradient.new(root, {
  stops: [{
    opacity: 0.2
  }, {
    opacity: 0
  }],
  rotation: 90
}));

var valueTooltip = valueSeries1.set("tooltip", am5.Tooltip.new(root, {
  getFillFromSprite: false,
  getStrokeFromSprite: true,
  getLabelFillFromSprite: true,
  autoTextColor: false,
  pointerOrientation: "horizontal",
  labelText: "{valueY}"
}));
valueTooltip.get("background").set("fill", root.interfaceColors.get("background"));

var firstColor = chart.get("colors").getIndex(0);

// volumen series
var series = chart.series.push(
  am5xy.ColumnSeries.new(root, {
      name: "Income",
      xAxis: peopleAxes,
      yAxis: yAxis,
      valueYField: "steps",
      categoryXField: "name",
      sequencedInterpolation: true,
      calculateAggregates: true,
      maskBullets: false,
      tooltip: am5.Tooltip.new(root, {
          dy: -20,
          pointerOrientation: "vertical",
          labelText: "{valueY}"
      })
  })
);

series.columns.template.setAll({
  strokeOpacity: 0,
  cornerRadiusBR: 6,
  cornerRadiusTR: 6,
  cornerRadiusBL: 6,
  cornerRadiusTL: 6,
  maxWidth: 50,
  fillOpacity: 0.8
});

var currentlyHovered;

series.columns.template.events.on("pointerover", function (e) {
  handleHover(e.target.dataItem);
});

series.columns.template.events.on("pointerout", function (e) {
  handleOut();
});

function handleHover(dataItem) {
  if (dataItem && currentlyHovered != dataItem) {
      handleOut();
      currentlyHovered = dataItem;
      var bullet = dataItem.bullets[0];
      bullet.animate({
          key: "locationY",
          to: 1,
          duration: 600,
          easing: am5.ease.out(am5.ease.cubic)
      });
  }
}

function handleOut() {
  if (currentlyHovered) {
      var bullet = currentlyHovered.bullets[0];
      bullet.animate({
          key: "locationY",
          to: 0,
          duration: 600,
          easing: am5.ease.out(am5.ease.cubic)
      });
  }
}

var circleTemplate = am5.Template.new({});

series.bullets.push(function (root, series, dataItem) {
  var bulletContainer = am5.Container.new(root, {});
  var circle = bulletContainer.children.push(
      am5.Circle.new(
          root,
          {
              radius: 14
          },
          circleTemplate
      )
  );

  var maskCircle = bulletContainer.children.push(
      am5.Circle.new(root, { radius: 17 })
  );

  // only containers can be masked, so we add image to another container
  var imageContainer = bulletContainer.children.push(
      am5.Container.new(root, {
          mask: maskCircle
      })
  );

  // not working
  var image = imageContainer.children.push(
      am5.Picture.new(root, {
          templateField: "pictureSettings",
          centerX: am5.p50,
          centerY: am5.p50,
          width: 40,
          height: 40
      })
  );

  return am5.Bullet.new(root, {
      locationY: 0,
      sprite: bulletContainer
  });
});

// // Add scrollbar
// // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
// var scrollbarX = am5.Scrollbar.new(root, {
//     orientation: "horizontal",
//     height: 10
// });
// chart.set("scrollbarX", scrollbarX);
// chart.bottomAxesContainer.children.push(scrollbarX);

// heatrule
series.set("heatRules", [
  {
      dataField: "valueY",
      min: am5.color(0x3A3A4A),
      max: am5.color(0x3C3C64),
      target: series.columns.template,
      key: "fill"
  },
  {
      dataField: "valueY",
      min: am5.color(0x3A3A4A),
      max: am5.color(0x3C3C64),
      target: circleTemplate,
      key: "fill"
  }
]);


// series.data.setAll(data);
// peopleAxes.data.setAll(data);

var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
cursor.lineX.set("visible", false);
cursor.lineY.set("visible", false);

cursor.events.on("cursormoved", function () {
  var dataItem = series.get("tooltip").dataItem;
  if (dataItem) {
      handleHover(dataItem);
  } else {
      handleOut();
  }
});

// Make stuff animate on load
// https://www.amcharts.com/docs/v5/concepts/animations/
series.appear();

// Add legend to axis header
// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/axis-headers/
// https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
var valueLegend = valueAxis.axisHeader.children.push(
  am5.Legend.new(root, {
  useDefaultMarker: true
})
);
valueLegend.data.setAll([valueSeries1]);

var volumeLegend = yAxis.axisHeader.children.push(
  am5.Legend.new(root, {
  useDefaultMarker: true
})
);
volumeLegend.data.setAll([series]);


// Stack axes vertically
// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/#Stacked_axes
chart.rightAxesContainer.set("layout", root.verticalLayout);


// Add cursor
// https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
chart.set("cursor", am5xy.XYCursor.new(root, {}))


// Add scrollbar
// https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
var scrollbar = chart.set("scrollbarX", am5xy.XYChartScrollbar.new(root, {
  orientation: "horizontal",
  height: 30
}));

var sbDateAxis = scrollbar.chart.xAxes.push(am5xy.DateAxis.new(root, {
  groupData: true,
  groupIntervals: [{
    timeUnit: "week",
    count: 1
  }],
  baseInterval: {
    timeUnit: "day",
    count: 1
  },
  renderer: am5xy.AxisRendererX.new(root, {})
}));

var sbValueAxis = scrollbar.chart.yAxes.push(
  am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererY.new(root, {})
  })
);

var sbSeries = scrollbar.chart.series.push(am5xy.LineSeries.new(root, {
  valueYField: "price1",
  valueXField: "date",
  xAxis: sbDateAxis,
  yAxis: sbValueAxis
}));

sbSeries.fills.template.setAll({
  visible: true,
  fillOpacity: 0.3
});


// Generate random data and set on series
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/#Setting_data
var data2 = [{
  name: "Monica",
  steps: 45688,
  pictureSettings: {
      src: "https://www.amcharts.com/wp-content/uploads/2019/04/monica.jpg"
  }
}, {
  name: "Joey",
  steps: 35781,
  pictureSettings: {
      src: "https://www.amcharts.com/wp-content/uploads/2019/04/joey.jpg"
  }
}, {
  name: "Ross",
  steps: 25464,
  pictureSettings: {
      src: "https://www.amcharts.com/wp-content/uploads/2019/04/ross.jpg"
  }
}, {
  name: "Phoebe",
  steps: 18788,
  pictureSettings: {
      src: "https://www.amcharts.com/wp-content/uploads/2019/04/phoebe.jpg"
  }
}, {
  name: "Rachel",
  steps: 15465,
  pictureSettings: {
      src: "https://www.amcharts.com/wp-content/uploads/2019/04/rachel.jpg"
  }
}, {
  name: "Chandler",
  steps: 11561,
  pictureSettings: {
      src: "https://www.amcharts.com/wp-content/uploads/2019/04/chandler.jpg"
  }

}, {
  name: "John",
  steps: 48561,
  pictureSettings: {
      src: "https://www.amcharts.com/wp-content/uploads/2019/04/chandler.jpg"
  }
}];

var data = [];
var price1 = 1000;
var quantity = 10000;

for (var i = 1; i < 5000; i++) {
  price1 += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 20);

  if (price1 < 100) {
    price1 = 100;
  }

  quantity += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 500);

  if (quantity < 0) {
    quantity *= -1;
  }
  data.push({
    date: new Date(2010, 0, i).getTime(),
    price1: price1,
    quantity: quantity
  });
}

valueSeries1.data.setAll(data);
series.data.setAll(data2);
peopleAxes.data.setAll(data2);
sbSeries.data.setAll(data);


// Make stuff animate on load
// https://www.amcharts.com/docs/v5/concepts/animations/
chart.appear(1000, 100);

}); // end am5.ready()
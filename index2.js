am5.ready(function() {

  var root = am5.Root.new("chartdiv");

  root.setThemes([
    am5themes_Animated.new(root)
  ]);

  var chart = root.container.children.push(am5xy.XYChart.new(root, {
    panX: true,
    panY: false,
    wheelX: "panX",
    wheelY: "zoomX",
    layout: root.verticalLayout
  }));

  // Create axes for 1
  var xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
    maxDeviation: 0.5,
    baseInterval: {
        timeUnit: "day",
        count: 1
    },
    renderer: am5xy.AxisRendererX.new(root, {
        pan: "zoom"
    }),
    tooltip: am5.Tooltip.new(root, {})
  }));

  var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 1,
      renderer: am5xy.AxisRendererY.new(root, {
          pan: "zoom"
      })
  }));

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/

    var xRenderer = am5xy.AxisRendererX.new(root, {});
    xRenderer.grid.template.set("visible", false);

    var peopleAxes = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
            paddingTop: 20,
            categoryField: "name",
            renderer: xRenderer
        })
    );


    var yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.grid.template.set("strokeDasharray", [3]);

    var yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
            min: 0,
            renderer: yRenderer
        })
    );

        // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
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
      maxWidth: 150,
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
  

  series.data.setAll(data);
  peopleAxes.data.setAll(data);

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
  chart.appear(1000, 100);

  // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
  }));
  cursor.lineY.set("visible", false);


  // Generate random data
  var date = new Date();
  date.setHours(0, 0, 0, 0);
  var value = 100;

  function generateData() {
      value = Math.round((Math.random() * 10 - 5) + value);
      am5.time.add(date, "day", 1);
      return {
          date: date.getTime(),
          value: value
      };
  }

  function generateDatas(count) {
      var data = [];
      for (var i = 0; i < count; ++i) {
          data.push(generateData());
      }
      return data;
  }

   // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var series = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY}"
      })
  }));

  series.fills.template.setAll({
      visible: true,
      fillOpacity: 0.2
  });

  series.fills.template.set("fillGradient", am5.LinearGradient.new(root, {
      stops: [{
        opacity: 0.2
      }, {
        opacity: 0
      }],
      rotation: 90
    }));

  series.bullets.push(function () {
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
  // Pre-zoom X axis to last hour
  series.events.once("datavalidated", function (ev, target) {
      var lastDate = new Date(data[data.length - 400].date);
      var firstDate = new Date(data[data.length - 2].date);
      xAxis.zoomToDates(firstDate, lastDate);
  })


  // // Add scrollbar
  // // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
  // var scrollbarX = am5.Scrollbar.new(root, {
  //     orientation: "horizontal",
  //     height: 40
  // });
  
  // chart.set("scrollbarX", scrollbarX);
  // chart.bottomAxesContainer.children.push(scrollbarX);

  

    


  var data = generateDatas(400);
  series.data.setAll(data);


  // Make stuff animate on load
  // https://www.amcharts.com/docs/v5/concepts/animations/
  series.appear(1000);
  chart.appear(100, 100);




})
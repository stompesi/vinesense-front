
// 온도차이에 구간 구하는 함수 
function getPlotBandsGapTemperature(standardData, compareData, optionLow) {
  var plotBands,
      points,
      data,
      onGoing,
      j,
      k,
      standardDataIndex,
      compareDataIndex,
      sectionColor;

  plotBands = [];
  points = [];
  data = [];
  onGoing = false;
  optionLow = optionLow || false;
  j = standardDataIndex = compareDataIndex = 0;
  sectionColor = optionLow ? 'rgba(28, 186, 188, .6)' : 'rgba(206, 89, 115, .6)';

  while((compareDataIndex < compareData.length) && (standardDataIndex < standardData.length)) {
    if(standardData[standardDataIndex][0] > compareData[compareDataIndex][0]) {
      compareDataIndex++;
      continue;
    } else if(standardData[standardDataIndex][0] < compareData[compareDataIndex][0]){
      standardDataIndex++;
      continue;
    }

    if((!onGoing) && ((standardData[standardDataIndex][1] >= compareData[compareDataIndex][1]) ^ optionLow)) {
      onGoing = true;
      plotBands[j] = {
        from: calCrossingPositon(standardData, compareData, standardDataIndex, compareDataIndex),
        color: sectionColor
      };
      data[j] = {
        startDate: standardData[standardDataIndex + 1][0],
        standardAverageTemperature: standardData[standardDataIndex][1],
        compareAverageTemperature: compareData[compareDataIndex][1],
        days: 1
      };
      points[k++] = [standardData[standardDataIndex + 1][0], Math.abs((standardData[standardDataIndex][1] - compareData[compareDataIndex][1]))];
    } else if((onGoing) && ((standardData[standardDataIndex][1] <= compareData[compareDataIndex][1]) ^ optionLow)) {
      onGoing = false;
      plotBands[j].to = calCrossingPositon(standardData, compareData, standardDataIndex, compareDataIndex);
      data[j].endDate = standardData[standardDataIndex][0];

      data[j].standardAverageTemperature /= data[j].days;
      data[j].compareAverageTemperature /= data[j].days;

      j++;
    } else if(onGoing){
      data[j].standardAverageTemperature += standardData[standardDataIndex][1];
      data[j].compareAverageTemperature += compareData[compareDataIndex][1];
      data[j].days += 1;

      points[k++] = [standardData[standardDataIndex + 1][0], Math.abs((standardData[standardDataIndex][1] - compareData[compareDataIndex][1]))];
    }
    compareDataIndex++;
    standardDataIndex++;
  }

  if(onGoing) {
    data[j].endDate = compareDataIndex == compareData.length ? standardData[standardDataIndex][0] : compareData[compareDataIndex][0];
    compareDataIndex -= 1;
    standardDataIndex -= 1;

    plotBands[j].to = calCrossingPositon(standardData, compareData, standardDataIndex, compareDataIndex);

    data[j].standardAverageTemperature /= data[j].days;
    data[j].compareAverageTemperature /= data[j].days;
  }

  return { 
    plotBands: plotBands,
    data: data,
    points: points,
  };
}

// 데이터로부터 점가져오는 함수 
function getPoints(standardData, compareData, standardDataIndex, compareDataIndex) {
  var points = [];
  points[0] = {
    x: standardData[standardDataIndex-1][0],
    y: standardData[standardDataIndex-1][1]  
  };

  points[1] = {
    x: standardData[standardDataIndex][0],
    y: standardData[standardDataIndex][1]  
  };

  points[2] = {
    x: compareData[compareDataIndex-1][0],
    y: compareData[compareDataIndex-1][1]
  };
  
  points[3] = {
    x: compareData[compareDataIndex][0],
    y: compareData[compareDataIndex][1]
  };
  return points;
}

// 온도차이에 교차하는 점 구하는 함수 
function calCrossingPositon(standardData, compareData, standardDataIndex, compareDataIndex) {
  if(standardDataIndex == 0) {
    return standardData[0][0];
  } else if(compareDataIndex == 0) {
    return compareData[0][0];
  } else {
    var points = getPoints(standardData, compareData, standardDataIndex, compareDataIndex);
    return ((points[0].x * points[1].y - points[0].y * points[1].x) * (points[2].x - points[3].x) - (points[0].x - points[1].x) * (points[2].x * points[3].y - points[2].y * points[3].x)) / ((points[0].x - points[1].x) * (points[2].y - points[3].y) - (points[0].y - points[1].y) * (points[2].x - points[3].x));    
  }
}
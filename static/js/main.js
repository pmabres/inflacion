/**
* MIT License
*
* Copyright (c) 2016 Francisco Mabres
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*
* All the data was retrieved from:
* http://inflacionverdadera.com/
* Copyright to Billion Prices Project
*/

(function(){
	var inflationList;
	loadData();
	$(document).ready(function() {
		$('select').material_select();
	    $('#submit').click(function() {
	    	var monthStart = $('#monthfrom').val();
	    	var yearStart = $('#yearfrom').val();
	    	var monthEnd = $('#monthto').val();
	    	var yearEnd = $('#yearto').val();
	    	dateStart = dateParse(monthStart + "/" + yearStart);
		    dateEnd = dateParse(monthEnd + "/" + yearEnd);
		    dateEnd.setMonth(dateEnd.getMonth() + 1);
		    dateEnd.setDate(dateEnd.getDate() - 1);
	    	var values = calculateInflation(dateStart,dateEnd);
	    	$('.inflacionContainer').hide();
	    	$('#indecContainer').hide();
	    	if (parseFloat(values.real) && parseFloat(values.real) >= 0) {
	    		$('#total').text(parseFloat(values.real).toFixed(2));
		    	if (parseFloat(values.indec)) {
		    		$('#indecContainer').show();
		    		$('#totalIndec').text(parseFloat(values.indec).toFixed(2));
		    	}
	    		$('.inflacionContainer').show();
	    	}
	    });
	});
 	function loadData() {
		if (window.XMLHttpRequest) {
			var request = new XMLHttpRequest();
		}
		else {
			var request = new ActiveXObject('Microsoft.XMLHTTP');
		}
		request.open('GET', "./data/data.txt");
		request.onload = function(event) {
			inflationList = parseData(event.target.responseText);
			console.log("file loaded");
		}
		request.send();
	}

	function calculateInflation(dateStart, dateEnd) {
		var startCount;
		var endCount;
		var startMonth = dateStart.getMonth();
		//dateEnd.setDate(dateEnd.getDate() - 1);
		var endMonth = dateEnd.getMonth();
		var indexCount = 0;
		var startInflation = 0;
		var endInflation = 0;
		var startCalculated = false;
		var endCalculated = false;
		var startInflationIndec = 0;
		var endInflationIndec = 0
		for (var i=0;i<inflationList.length;i++) {
			if (endCalculated && startCalculated)
				break;

			if (inflationList[i].date.getTime() === dateStart.getTime() && !startCount) {
				startCount = true;
				indexCount = 0;
			}
			if (startCalculated && inflationList[i].date.getMonth() == endMonth && inflationList[i].date.getYear() == dateEnd.getYear() && !endCount) {
				indexCount = 0;
				endCount = true;
			}

			if (startCount) {
				indexCount++;
				startInflation += parseFloat(inflationList[i].psindex);
				startInflationIndec += parseFloat(inflationList[i].indec);
				if (startMonth != inflationList[i+1].date.getMonth()) {
					startInflation /= indexCount;
					startInflationIndec /= indexCount;
					startCount = false;
					startCalculated = true;
				}
			}

			if (endCount) {
				indexCount++
				endInflation += parseFloat(inflationList[i].psindex);
				endInflationIndec += parseFloat(inflationList[i].indec);
				if (dateEnd.getTime() === inflationList[i+1].date.getTime()) {
					endInflation /= indexCount;
					endInflationIndec /= indexCount;
					endCount = false;
					endCalculated = true;
				}
			}
		}
		return { real:(endInflation-startInflation)/startInflation*100,indec:(endInflationIndec-startInflationIndec)/startInflationIndec*100};
	}

	function dateParse(date) {
		//if date format is MM/yyyy 7 chars
		if (date.length == 7) {
			return new Date(date.substr(3,4),parseInt(date.substr(0,2))-1,1);
		} else {
			return new Date(date.substr(6,4),parseInt(date.substr(3,2))-1,date.substr(0,2));
		}
	}

	function parseData(data){
		//replace UNIX new lines
		data = data.replace (/\r\n/g, "\n");
		//replace MAC new lines
		data = data.replace (/\r/g, "\n");
		//split into rows
		var rows = data.split("\n");
		// create array which will hold our data:
		dataList = [];
		for (var i = 0; i < rows.length; i++){
			if (rows[i]) {
				var column = rows[i].split(",");
				var date = column[0].split("-");
				var date = new Date(parseInt(date[2]),parseInt(date[0])-1,parseInt(date[1]));
				var data = {date:date, psindex:column[1]};
				if(column[2].length)
					data.indec = column[2];
				dataList.push(data);
			}
		}
		return dataList;
	}
})();


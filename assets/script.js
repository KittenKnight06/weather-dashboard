var APIkey = "28192cc5dd81f85bcfd688d592d9a8ab";

var cityInputEl = $('#city-input');
var searchBtn = $('#search-button');
var clearBtn = $('#clear-button');
var pastSearchedCitiesEl = $('#past-searches');

var city;

// use Open Weather 'One Call API' to get weather based on city coordinates
function getWeather(data) {

    var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&exclude=minutely,hourly,alerts&units=metric&appid=${APIkey}`
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            // current weather
            var currentConditionsEl = $('#currentConditions');
            currentConditionsEl.addClass('border border-primary');

            // create city name element and display
            var cityNameEl = $('<h2>');
            cityNameEl.text(city);
            currentConditionsEl.append(cityNameEl);
            
            // get date from results and display by appending to city name element
            var cityDate = data.current.dt;
            cityDate = moment.unix(cityDate).format("DD/MM/YYYY");
            var currentDateEl = $('<span>');
            currentDateEl.text(` (${cityDate}) `);
            cityNameEl.append(currentDateEl);

            // get weather icon and display by appending to city name element            
            var cityWeatherIcon = data.current.weather[0].icon; // current weather icon
            var currentWeatherIconEl = $('<img>');
            currentWeatherIconEl.attr("src", "http://openweathermap.org/img/wn/" + cityWeatherIcon + ".png");
            cityNameEl.append(currentWeatherIconEl);

            // get current temp data and display
            var cityTemp = data.current.temp;
            var currentTempEl = $('<p>')
            currentTempEl.text(`Temp: ${cityTemp}°C`)
            currentConditionsEl.append(currentTempEl);
            
            // get current wind speed and display
            var cityWind = data.current.wind_speed;
            var currentWindEl = $('<p>')
            currentWindEl.text(`Wind: ${cityWind} KPH`)
            currentConditionsEl.append(currentWindEl);

            // get current humidity and display
            var cityHumidity = data.current.humidity;
            var currentHumidityEl = $('<p>')
            currentHumidityEl.text(`Humidity: ${cityHumidity}%`)
            currentConditionsEl.append(currentHumidityEl);

            // get current UV index, set background color based on level and display
            var uvIndex = data.current.uvi;
            var currentUvEl = $('<p>');
            var currentUvSpanEl = $('<span>');
            currentUvEl.append(currentUvSpanEl);

            currentUvSpanEl.text(`UV Index: ${uvIndex}`)
            
            if ( uvIndex < 3 ) {
                currentUvSpanEl.css({'background-color':'green', 'color':'white'});
            } else if ( uvIndex < 8 ) {
                currentUvSpanEl.css({'background-color':'orange', 'color':'white'});
            } else {
                currentUvSpanEl.css({'background-color':'red', 'color':'white'});
            }
            currentConditionsEl.append(currentUvEl);

            // 5 - Day Forecast
            // create 5 Day Forecast <h2> header
            var fiveDayForecastHeaderEl = $('#fiveDayForecastHeader');
            var fiveDayHeaderEl = $('<h2>');
            fiveDayHeaderEl.text('5-Day Forecast:');
            fiveDayForecastHeaderEl.append(fiveDayHeaderEl);

            var fiveDayForecastEl = $('#fiveDayForecast');

            // get key weather info from API data for five day forecast and display
            for (var i = 1; i <=5; i++) {
                var date;
                var temp;
                var icon;
                var wind;
                var humidity;

                date = data.daily[i].dt;
                date = moment.unix(date).format("DD/MM/YYYY");

                temp = data.daily[i].temp.day;
                icon = data.daily[i].weather[0].icon;
                wind = data.daily[i].wind_speed;
                humidity = data.daily[i].humidity;

                // create a card
                var card = document.createElement('div');
                card.classList.add('card', 'col-2', 'm-1', 'bg-primary', 'text-white');
                
                // create card body and append
                var cardBody = document.createElement('div');
                cardBody.classList.add('card-body');
                cardBody.innerHTML = `<h6>${date}</h6>
                                      <img src= "http://openweathermap.org/img/wn/${icon}.png"> </><br>
                                       ${temp}°C<br>
                                       ${wind} KPH <br>
                                       ${humidity}%`
                
                card.appendChild(cardBody);
                fiveDayForecastEl.append(card);
            }
        })
    return;
}

// Display search history as buttons
function displaySearchHistory() {
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
    var pastSearchesEl = document.getElementById('past-searches');

    pastSearchesEl.innerHTML ='';

    for (i = 0; i < storedCities.length; i++) {
        
        var pastCityBtn = document.createElement("button");
        pastCityBtn.classList.add("btn", "btn-primary", "my-2", "past-city");
        pastCityBtn.setAttribute("style", "width: 100%");
        pastCityBtn.textContent = `${storedCities[i].city}`;
        pastSearchesEl.appendChild(pastCityBtn);
    }
    return;
}

// use Open Weather 'Current weather data (API)' to get city coordinates to then send to 'One Call API' to get weather
function getCoordinates () {
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`;
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

    fetch(requestUrl)
      .then(function (response) {
        if (response.status >= 200 && response.status <= 299) {
            return response.json();
          } else {
            throw Error(response.statusText);
          }
      })
      .then(function(data) {
 
        var cityInfo = {
            city: city,
            lon: data.coord.lon,
            lat: data.coord.lat
        }

        storedCities.push(cityInfo);
        localStorage.setItem("cities", JSON.stringify(storedCities));

        displaySearchHistory();

        return cityInfo;
      })
      .then(function (data) {
        getWeather(data);
      })
      return;
}

// handle requst to clear past search history
function handleClearHistory (event) {
    event.preventDefault();
    var pastSearchesEl = document.getElementById('past-searches');

    localStorage.removeItem("cities");
    pastSearchesEl.innerHTML ='';

    return;
}

function clearcityWeather () {
    var currentConditionsEl = document.getElementById("currentConditions");
    currentConditionsEl.innerHTML = '';

    var fiveDayForecastHeaderEl = document.getElementById("fiveDayForecastHeader");
    fiveDayForecastHeaderEl.innerHTML = '';

    var fiveDayForecastEl = document.getElementById("fiveDayForecast");
    fiveDayForecastEl.innerHTML = '';

    return;
}

// handle submit of city name by trimming and sending to getCoordinates function, clear HTML display of past weather data, cards, titles
function handleCityFormSubmit (event) {
    event.preventDefault();
    city = cityInputEl.val().trim();

    clearcityWeather();
    getCoordinates();

    return;
}

// When user clicks on city previously searched, an updated forecast will be retrieved and displayed
function getPastCity (event) {
    var element = event.target;

    if (element.matches(".past-city")) {
        city = element.textContent;
        
        clearcityWeather();

        var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`;
        
        fetch(requestUrl)
          .then(function (response) {
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
              } else {
                throw Error(response.statusText);
              }
           })
           .then(function(data) {
                var cityInfo = {
                    city: city,
                    lon: data.coord.lon,
                    lat: data.coord.lat
                }
                return cityInfo;
            })
           .then(function (data) {
                getWeather(data);
        })
    }
    return;
}

displaySearchHistory();

searchBtn.on("click", handleCityFormSubmit);

clearBtn.on("click", handleClearHistory);

pastSearchedCitiesEl.on("click", getPastCity);
class BookingModel{
    constructor(){
		this.initLocalStorage();
        this.cinemaData = JSON.parse(localStorage.getItem("moviesData")) || {};
        this.currentMovieId = 1;
        this.currentMovieTitle = "";
        this.currentTime = null;
        this.currentSeat = null;
        this.timeList =  [];
    }
    init(){
        this.getCurrentMovieTitle();
        return this.getCurrentSeance();
    }
	initLocalStorage(){
		if (!localStorage.getItem("moviesData")) {
			localStorage.setItem("moviesData", JSON.stringify(MOVIE_LIST));
		}
	}
    saveToLocalStorage(){
        localStorage.setItem("moviesData", JSON.stringify(this.cinemaData));
    }
    setCurrentMovie(currentMovie){
        this.currentMovieId = currentMovie.data("id");
        this.getCurrentMovieTitle();
        this.getCurrentSeance();
    }
    getCurrentMovieTitle(){
        const currentMovie = this.cinemaData.movies.filter((currentMovie) => {
            return currentMovie.id == this.currentMovieId;
        });
        this.currentMovieTitle = currentMovie[0].title;
        console.log(this.currentMovieTitle);
    }
    getCurrentSeance(){
        let seanceData = this.cinemaData.seances.filter((currentSeance) =>{
            return currentSeance.moovieId == this.currentMovieId;
        });
        return this.getCurrentSeanceTimeTable(seanceData);
    }
    getCurrentSeanceTimeTable(seanceData){
        this.timeList = [];
        const data = seanceData.map((currentSeance) =>{
            this.timeList.push(currentSeance.time);
            return {
                timeTable: currentSeance.time,
                availableSeats: currentSeance.availableSeats
            };
        });
        this.currentTime = this.timeList[0];
        return data;
    }
    getCurrentAvailableSeats(currentTime){
        this.currentTime = currentTime;
        let availableSeats = [];
        this.cinemaData.seances.forEach((currentSeance) =>{
            if(currentSeance.moovieId == this.currentMovieId && currentSeance.time == currentTime){
                availableSeats = currentSeance.availableSeats;
            }
        });
        console.log(availableSeats);
        return availableSeats;
    }
    deleteCurrentSeat(currentSeat){
        this.currentSeat = currentSeat;
        let currentSeanceIndex = 0;
        const currentSeance = this.cinemaData.seances.filter((currentSeance, index) => {
            const conditionResult = currentSeance.moovieId == this.currentMovieId && currentSeance.time == this.currentTime;
            if (conditionResult){
                currentSeanceIndex = index;
                
            }
            return conditionResult
        });

        currentSeance[0].availableSeats.splice(currentSeance[0].availableSeats.indexOf(this.currentSeat), 1);
        this.cinemaData.seances[currentSeanceIndex] = currentSeance[0];
        this.saveToLocalStorage();
    }
}
class BookingView {
    constructor(id) {
        this.bookingApp = $(id);
        this.movieList = this.bookingApp.find(".cinema__movie-list");
        this.timeList = this.bookingApp.find(".cinema__movie-time-list");
        this.seatsList = this.bookingApp.find(".cinema__seats");
        this.currentSeat = null;
        this.reservationForm = this.bookingApp.find(".cinema__reservation-form");

        
    }
    getMovieList(movieListData){
        let movieList = "";
        movieListData.forEach(movieData=> {
            movieList += this.getMovieTemplate(movieData);
        });
        this.movieList.html(movieList);
        this.movieList.children(".movie-list__item:first-child").addClass("movie-list__item_current");
    }
    getMovieTemplate(movieData){
        return `<div class ="movie movie-list__item" data-id="${movieData.id}">
        <img src="images/${movieData.poster}.jpg" alt="${movieData.title}" class="movie__poster">
        <h3 class="movie__title">${movieData.title}</h3>
        </div>`;
    }
    getTicket(ticketData){
        this.reservationForm.after(this.getTicketTemplate(ticketData));
    }
    getTicketTemplate(ticketData){
         const { movieTitle, movieTime, seat, hall, row, name } = ticketData;
        return `<div class="cardWrap">
                    <div class="card cardLeft">
                        <h1>Startup <span>Cinema</span></h1>
                        <div class="title">
                            <h2>${movieTitle}</h2>
                            <span>movie</span>
                        </div>
                        <div class="name">
                            <h2>${name}</h2>
                            <span>name</span>
                        </div>
                        <div class="seat">
                            <h2>${seat}</h2>
                            <span>seat</span>
                        </div>
                        <div class="time">
                            <h2>${movieTime}</h2>
                            <span>time</span>
                        </div>
                        
                        </div>
                        <div class="card cardRight">
                        <div class="eye"></div>
                        <div class="number">
                            <h3>${seat}</h3>
                            <span>seat</span>
                        </div>
                        <div class="barcode"></div>
                    </div>        
                </div>`;
    }
    getMovieTimeList(time){
        let timeList = "";
        console.log(time);
        time.forEach((currentTime, index) =>{
            timeList += `<a href="#" data-time="${currentTime}" class="movie-time-list__item ${index === 0 ? "movie-time-list__item_current" : ""}">${currentTime}</a> `
        });
        this.timeList.html(timeList);
        
    }
    getMovieSeatsList(availableSeats){
        let seatsList = "";
        let rowCounter = 1;
        let seatNum = 0;
        // let availableSeats = [2, 3, 9, 10, 11, 20, 21, 22, 23, 55];
        let soldClassName = "";
        for(let i = 0; i < CINEMA_SEATS_NUM; i++){
            if(!availableSeats.includes(i + 1)){
                soldClassName = "seats__seat_sold";
            }
            else{
                soldClassName = "";
            }
            if(seatNum < CINEMA_ROW_SEATS_NUM){
                seatNum ++;
            }
            else{
                seatNum = 1;
                rowCounter++;
            }
            seatsList += `<div class="seats__seat ${soldClassName}" data-num="${i+1}">${seatNum}</div>`;
        }
        this.seatsList.html(seatsList);
    }
    bindSelectMovie(handler){
        const movieListItems = this.movieList.children(".movie-list__item");
        movieListItems.click((event) =>{
            const currentMovie = $(event.currentTarget);
            handler(currentMovie);
            movieListItems.removeClass("movie-list__item_current");
            currentMovie.addClass("movie-list__item_current");
        });
    }
    bindSelectTime(handler){
        const timeListItems = this.timeList.find(".movie-time-list__item");
        timeListItems.click((event) =>{
            event.preventDefault();
            const currentTime = $(event.currentTarget);
            handler(currentTime.data("time"));
            timeListItems.removeClass("movie-time-list__item_current");
            currentTime.addClass("movie-time-list__item_current");
        });
    }
    bindSelectSeat(handler){
        const seatsListItems =this.seatsList.find(".seats__seat");
        seatsListItems.click((event) => {
            this.currentSeat = $(event.currentTarget);
            handler(this.currentSeat.data("num"));
            this.currentSeat.addClass("seats__seat_sold");
        });
    }
    bindBookTicket(handler){
        this.reservationForm.submit((event) =>{
            event.preventDefault();
            const ticketData = {
                movieTitle: this.movieList.find(".movie-list__item_current .movie__title").text(),
                movieTime: this.timeList.find(".movie-time-list__item_current").text(),
                seat: this.currentSeat.data("num"),
                hall: "Test",
                row: "Test1",
                name: this.reservationForm.find(".reservation-form__textfield_name").val()
            };
            // handler(ticketData);
            this.getTicket(ticketData);
        });
    }
}
class BookingController{
    constructor(model, view){
        this.model = model;
        this.view = view;

        // this.onMovieListLoad(this.model.cinemaData.movies, this.model.timeList);
        this.onMovieListLoad(this.model.cinemaData.movies);
    }
    onMovieListLoad(movies){
        this.view.getMovieList(movies);
        const seanceData = this.model.init();
        this.view.getMovieTimeList(this.model.timeList);
        this.view.getMovieSeatsList(seanceData[0].availableSeats);
        this.view.bindSelectMovie(this.handleSelectMovie.bind(this));
        this.view.bindSelectTime(this.handleSelectTime.bind(this));
        this.view.bindSelectSeat(this.handleSelectSeat.bind(this));
        this.view.bindBookTicket();

    }
    handleSelectMovie(currentMovie){
        this.model.setCurrentMovie(currentMovie);
        this.view.getMovieTimeList(this.model.timeList);
        const availableSeats = this.model.getCurrentAvailableSeats(this.model.timeList[0]);
        this.view.getMovieSeatsList(availableSeats);
        this.view.bindSelectTime(this.handleSelectTime.bind(this));
        this.view.bindSelectSeat(this.handleSelectSeat.bind(this));
    }
    handleSelectTime(currentTime){
        const availableSeats = this.model.getCurrentAvailableSeats(currentTime);
        this.view.getMovieSeatsList(availableSeats);
        this.view.bindSelectSeat(this.handleSelectSeat.bind(this));
    }
    handleSelectSeat(currentSeat){
        this.model.deleteCurrentSeat(currentSeat);
    }
}
const app = new BookingController(new BookingModel(), new BookingView("#root"));
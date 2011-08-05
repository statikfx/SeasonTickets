function(doc) {
  if (doc.type === "game" ) {
    var new_seats = [];
    var seats = doc.seats;
    for (var i = 0; i < seats.length; i++) {
      if (parseInt(seats[i].price, 10) <= 50) {
        new_seats.push(seats[i]);
      }
    }
    doc.seats = new_seats;
    if (doc.seats.length > 0) {
      emit(doc.date, doc);
    }
  }
}

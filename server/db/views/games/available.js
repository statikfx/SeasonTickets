// available games view
function(doc) {
  if (doc.type === "game") {
    if (doc.seats.length > 0) {
      emit(doc.date, doc);
    }
  }
}

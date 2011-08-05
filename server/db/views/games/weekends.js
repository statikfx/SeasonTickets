// weekend games view
function(doc) {
  if (doc.type === "game") {
    var date = new Date(doc.date + " " + doc.time);
    var dayOfWeek = date.getDay();
    if (dayOfWeek < 1 || dayOfWeek > 5)
    {
      emit(doc.date, doc);
    }
  }
}

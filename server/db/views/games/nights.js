// night games view
function(doc) {
  if (doc.type === "game" && doc.status === "approved") {
    var date = new Date(doc.date + " " + doc.time);
     
    if (date.getHours() > 17)
    {
      emit(doc.date, doc);
    }
  }
}

function(doc) {
  if (doc.type === "game") {
    emit(doc.date, doc);
  }
}
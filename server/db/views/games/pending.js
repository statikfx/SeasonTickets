function(doc) {
  if (doc.type === "game" && doc.status === "pending") {
    emit(doc.date, doc);
  }
}
function(doc) {
  if (doc.type === "game" && doc.status === "approved") {
    emit(doc.date, doc);
  }
}
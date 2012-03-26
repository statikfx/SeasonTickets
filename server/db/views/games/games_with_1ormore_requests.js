function(doc) {
  if (doc.requests.length > 0 && doc.closed !== "Y") {
    emit(doc.requests.length, doc);
  }
}

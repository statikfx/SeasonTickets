function(doc) {
  if (doc.type === "game")
  {
    emit(doc.opponent, doc);
  }
}
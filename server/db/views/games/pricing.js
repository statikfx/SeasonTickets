function(doc)
{
  if (doc.type === "pricing")
  {
    emit(doc.name, doc);
  }
}
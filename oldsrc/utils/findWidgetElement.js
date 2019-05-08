export function findWidgetElement() {
  const widgets = document.getElementsByClassName('just-comments');
  if (widgets.length === 0) {
    console.log(
      'JustComments warning: no elements with className just-comments found.',
    );
    return;
  }
  if (widgets.length > 1) {
    console.log(
      'JustComments warning: more than one element with className just-comments found.',
    );
  }
  return widgets[0];
}

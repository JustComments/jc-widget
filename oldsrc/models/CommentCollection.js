import commentsInThreads from '../utils/commentsInThreads';
import { sortByStrAttr, revSortByStrAttr, keyBy } from '../utils/_';

export class CommentCollection {
  constructor(comments, cursor, sort) {
    this.comments = this._buildNestedComments(comments);
    this.cursor = cursor || null;
    this.sort = sort;
    this.comments = this._buildThreads();
  }

  getCursor() {
    return this.cursor;
  }

  getComments() {
    return this.comments;
  }

  getSort() {
    return this.sort;
  }

  _buildThreads() {
    return commentsInThreads(this.comments, this.sort);
  }

  _buildNestedComments(comments) {
    const sortFn = this.sort === 'asc' ? sortByStrAttr : revSortByStrAttr;
    const sortedComments = sortFn(comments, 'createdAt');
    const byId = keyBy(sortedComments, 'commentId');
    return sortedComments.map((c) => {
      if (c.hasReplyTo()) {
        c.setReplyToComment(byId[c.replyTo]);
      }
      if (c.hasNestedComments()) {
        c.setNestedCommentsModels(c.nestedComments.map((id) => byId[id]));
      }
      return c;
    });
  }

  count() {
    return this.comments.filter(
      (c) =>
        !c.isHidden() ||
        (c.isHidden() &&
          c.getNestedCommentsModels().filter((nc) => !nc.isHidden()).length >
            0),
    ).length;
  }

  hasMore() {
    return !!this.cursor;
  }

  map(fn) {
    return this.comments.map(fn);
  }

  addComment(comment) {
    this.comments = [...this.comments, comment];
    this.comments = this._buildNestedComments(this.comments);
    this.comments = this._buildThreads();
    return this;
  }

  merge(collection) {
    const comments = this.comments.concat(collection.comments);
    return new CommentCollection(
      comments,
      collection.getCursor(),
      collection.getSort(),
    );
  }
}

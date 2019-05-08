import locale from 'TIMEAGO_LOCALE';
import timeago from 'timeago.js';

timeago.register('locale', locale);

export class Comment {
  constructor(data) {
    this.data = data;
    this.level = 0;
    this.sortKey = null;
    this.nestedCommentsModels = [];
    this.replyToComment = null;
    this.ago = timeago();
  }

  get parentId() {
    return this.data['parentId'];
  }

  get replyTo() {
    return this.data['replyTo'];
  }

  get itemId() {
    return this.data['itemId'];
  }

  get commentUrl() {
    return this.data['commentUrl'];
  }

  get userPic() {
    return this.data['userPic'];
  }

  get htmlMessage() {
    return this.data['htmlMessage'];
  }

  get userUrl() {
    return this.data['userUrl'];
  }

  get username() {
    return this.data['username'];
  }

  get userId() {
    return this.data['userId'];
  }

  get commentId() {
    return this.data['commentId'];
  }

  get createdAt() {
    return this.data['createdAt'];
  }

  get nestedComments() {
    return this.data['nestedComments'] || [];
  }

  setNestedCommentsModels(models) {
    this.nestedCommentsModels = models;
  }

  getNestedCommentsModels() {
    return this.nestedCommentsModels;
  }

  setReplyToComment(comment) {
    this.replyToComment = comment;
  }

  hasNestedComments() {
    return !!this.nestedComments;
  }

  hasReplyTo() {
    return !!this.replyTo;
  }

  getReplyToComment() {
    return this.replyToComment;
  }

  isHidden() {
    return !!this.data['hidden'];
  }

  isThreadHidden() {
    return (
      this.isHidden() &&
      this.getNestedCommentsModels().every((nested) => nested.isHidden())
    );
  }

  getLevel() {
    return this.level;
  }

  getCreatedAgo() {
    return this.ago.format(this.createdAt, 'locale');
  }

  getCommentUrl() {
    const currentHostname = window.location.hostname;
    const currentPathname = window.location.pathname;
    const currentSearch = window.location.currentSearch || '';

    const commentUrl = this.commentUrl;
    if (
      commentUrl.indexOf(currentHostname) !== -1 &&
      commentUrl.indexOf(currentPathname) !== -1 &&
      commentUrl.indexOf(currentSearch) !== -1
    ) {
      return commentUrl;
    }

    const url = document.createElement('a');
    url.href = window.location.toString();
    url.hash = '#jc' + this.commentId;
    return url.toString();
  }
}

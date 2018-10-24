import { revSortByStrAttr, sortByStrAttr, sortByNumAttr } from './_';

export default function commentsInThreads(allComments, sort) {
  const sortFn = sort === 'asc' ? sortByStrAttr : revSortByStrAttr;
  const sorted = sortFn(allComments, 'createdAt');
  traverseTree(listToTree(sorted));
  return sortByNumAttr(sorted, 'sortKey').map((c) => {
    delete c.children;
    if (c.level > 5) {
      c.level = 5;
    }
    return c;
  });
}

function traverseTree(tree, cache = { sortKey: 1, level: 0 }) {
  for (var comment of tree) {
    comment.sortKey = cache.sortKey++;
    comment.level = cache.level;
    cache.level++;
    traverseTree(comment.children, cache);
    cache.level--;
  }
}

function listToTree(comments) {
  const tree = [];
  const childrenOf = {};

  for (let i = 0; i < comments.length; i++) {
    const item = comments[i];
    const id = item.commentId;
    const parentId = item.replyTo || 0;
    childrenOf[id] = childrenOf[id] || [];
    item.children = childrenOf[id];
    if (parentId != 0) {
      childrenOf[parentId] = childrenOf[parentId] || [];
      childrenOf[parentId].push(item);
    } else {
      tree.push(item);
    }
  }

  return tree;
}

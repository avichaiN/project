function HideAddComment(postID) {
  document.querySelector(`#AddCommentButton-${postID}`).classList.replace("hide", "show");
  document.querySelector(`#cancelButton-${postID}`).classList.replace("show", "hide");
  document.querySelector(`#addComment-${postID}`).classList.replace("show", "hide");
}

function ShowAddComment(postID) {
  document.querySelector(`#addComment-${postID}`).innerHTML = `<div>
    <p>הוסף תגובה</p>
    <form onsubmit='handleNewComment(event, "${postID}")'>
      <textarea style='resize: none;' name="message"></textarea>
      <input type='text' name="price" placeholder='מחיר'>
      <input type="submit" value="שלח">
    </form>
  </div>`;
  document.querySelector(`#AddCommentButton-${postID}`).classList.replace("show", "hide");
  document.querySelector(`#cancelButton-${postID}`).classList.replace("hide", "show");
  document.querySelector(`#addComment-${postID}`).classList.replace("hide", "show");
}

function PostFavoriteButtonClicked() {
  document.querySelector("#FavoriteButton").classList.toggle("Toggled");
}

// delete post user/admin
const handleDeletePost = (e) => {
  const postId = e.target.parentNode.dataset.id;
  const postTitle = e.target.parentNode.dataset.title;
  Swal.fire({
    title: "האם את/ה בטוח/ה?",
    html: `כותרת פוסט שנבחר: ${postTitle}<br>לא יהיה אפשר לשחזר מידע זה!`,
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "לא, בטל!",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "כן, מחק פוסט!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch("/posts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId
        }),
      }).then((res) => res.json()).then(async (data) => {
        if (data.deleted) {
          await Swal.fire({
            position: "center",
            icon: "success",
            title: "פוסט נמחק בהצלחה",
            showConfirmButton: false,
            timer: 1500,
          });
          const url = window.location.href;
          if (url.includes("posts")) {
            location.reload();
          } else {
            window.location.href = "/categories.html";
          }
        } else {
          alert("תקלה במחיקת פוסט");
        }
      });
    }
  });
};

const checkIfUserLikedComment = async (commentId, userId) => {
  let checkLike = false;
  await fetch("/comments/user/like/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      commentId,
      userId
    }),
  }).then((res) => res.json()).then((data) => {
    checkLike = data.checkLike;
  });
  return checkLike;
};

const checkHowMuchLikes = async (commentId) => {
  let likedAmount;
  await fetch("/comments/likedAmount", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      commentId
    }),
  }).then((res) => res.json()).then((data) => {
    likedAmount = data.likeAmount;
  });
  return likedAmount;
};

const handleNewComment = async (e, postID) => {
  e.preventDefault();
  let user = await getUserWhoPosted();
  const userId = user.id;
  const fName = user.fName;
  const lName = user.lName;
  const commentMessage = e.target.children.message.value;
  const commentPrice = e.target.children.price.value;
  fetch("/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      postID,
      userId,
      fName,
      lName,
      commentMessage,
      commentPrice,
    }),
  }).then((res) => res.json()).then(async (data) => {
    if (data.posted) {
      await Swal.fire({
        position: "center",
        icon: "success",
        title: "תגובה פורסמה בהצלחה",
        showConfirmButton: false,
        timer: 1500,
      });
      HideAddComment(postID)
      handleHidePostsComments(postID)
      setTimeout(function(){
        handleGetComments(postID)
      },500)
    } else {
      await Swal.fire({
        position: "center",
        icon: "error",
        title: "אנא בדוק שכל השדות תקינים",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  });
};

const handleDeleteComment = (commentId) => {
  Swal.fire({
    title: "האם את/ה בטוח/ה?",
    html: `לא יהיה אפשר לשחזר מידע זה!`,
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "לא, בטל!",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "כן, מחק תגובה!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch("/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId
        }),
      }).then((res) => res.json()).then(async (data) => {
        if (data.deleted) {
          await Swal.fire({
            position: "center",
            icon: "success",
            title: "תגובה נמחקה בהצלחה",
            showConfirmButton: false,
            timer: 1500,
          });
          location.reload();
        }
      });
    }
  });
};

const handleLikeComment = async (commentId) => {
  let user = await getUserWhoPosted();
  const userId = user.id;
  fetch("/comments/like", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      commentId,
      userId
    }),
  }).then((res) => res.json()).then(async () => {
    const likesAmount = await checkHowMuchLikes(commentId);
    document.querySelector(`.likeComment-${commentId}`).innerHTML = `<span onclick="handleUnLikeComment('${commentId}')" class="material-icons active center liked" title="הורד לייק">favorite_border
      </span><span class='likesAmount' >${likesAmount}</span>`;
  });
};

const handleUnLikeComment = async (commentId) => {
  let user = await getUserWhoPosted();
  const userId = user.id;
  fetch("/comments/like", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      commentId,
      userId
    }),
  }).then((res) => res.json()).then(async () => {
    const likesAmount = await checkHowMuchLikes(commentId);
    document.querySelector(`.likeComment-${commentId}`).innerHTML = `<span onclick="handleLikeComment('${commentId}')" class="material-icons active center unliked" title="לייק לתגובה">favorite_border
      </span><span class='likesAmount'>${likesAmount}</span>`;
  });
};

const handleFavoritePost = async (postID) => {
  let user = await getUserWhoPosted();
  const userId = user.id;
  fetch("/posts/favorite/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      postID,
      userId
    }),
  }).then((res) => res.json()).then(async () => {
    document.querySelector(`.fav-${postID}`).innerHTML = `<span class="material-icons fav" onclick="handleDeleteFavoritePost('${postID}')"> star </span><p>מועדפים</p>`;
    await Swal.fire({
      position: "center",
      icon: "success",
      title: "פוסט נוסף למועדפים",
      showConfirmButton: false,
      timer: 1500,
    });
  });
};

const handleDeleteFavoritePost = async (postID) => {
  let user = await getUserWhoPosted();
  const userId = user.id;
  fetch("/posts/favorite/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      postID,
      userId
    }),
  }).then((res) => res.json()).then(async () => {
    const url = window.location.href;
    const params = url.split("?")[1];
    document.querySelector(`.fav-${postID}`).innerHTML = `<span class="material-icons notFav" onclick="handleFavoritePost('${postID}')"> star </span><p>מועדפים</p>`;
    await Swal.fire({
      position: "center",
      icon: "success",
      title: "פוסט נמחק מהמועדפים",
      showConfirmButton: false,
      timer: 1500,
    });
    if (params.includes("myfavorites")) {
      location.reload();
    }
  });
};

const checkIfPostFavorite = async (postID, userId) => {
  let checkFav = false;
  await fetch("/posts/favorite/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      postID,
      userId
    }),
  }).then((res) => res.json()).then((data) => {
    checkFav = data.checkFav;
  });
  return checkFav;
};

const handleGetComments = async (postId, sort) => {
  const numberOfComments = await checkHowMuchComments(postId)
  if (numberOfComments >= 1) {
    const app = document.querySelector(`.renderComment-${postId}`);
    const loadingComments = document.querySelector(`.loadingComments-${postId}`)
    loadingComments.style.display = 'flex';
    if (app.innerHTML.length > 0) {
      loadingComments.style.display = 'none';
      handleHidePostsComments(postId)
    } else {
      fetch(`/comments/${postId}`).then((res) => res.json()).then(async (data) => {
        if (data.status === "unauthorized") {
          window.location.href = "index.html";
        } else {
          if (sort == 'date') {
            renderCommentsToDom(postId, data, 'date')
          } else if (sort == 'like') {
            renderCommentsToDom(postId, data, 'like')
          } else {
            renderCommentsToDom(postId, data, '')
          }
        }
      });
    }
  }
}

const sortCommentsByDate = (postId) => {
  const app = document.querySelector(`.renderComment-${postId}`);
  app.innerHTML = ''
  handleGetComments(postId, 'date')
}
const sortCommentsByLike = (postId) => {
  const app = document.querySelector(`.renderComment-${postId}`);
  app.innerHTML = ''
  handleGetComments(postId, 'like')
}

const renderCommentsToDom = async (postId, data, sort) => {
  const numberOfComments = await checkHowMuchComments(postId)
  let sortByLike = false
  let sortByDate = false
  if (sort == 'like') {
    sortByLike = true
  } else if (sort == 'date') {
    sortByDate = true
  }
  const app = document.querySelector(`.renderComment-${postId}`);
  const loadingComments = document.querySelector(`.loadingComments-${postId}`)
  document.querySelector(`.commentArrow-${postId}`).innerHTML = `<span data-id='${postId}' data-comments='${numberOfComments}' onclick="handleHidePostsComments('${postId}')" class="material-icons">arrow_upward</span>
<p data-id='${postId}' data-comments='${numberOfComments}' onclick="handleHidePostsComments('${postId}')">תגובות: ${numberOfComments}</p>`;
  app.innerHTML = ''
  let commentsHtml = ''
  let comments = data.comments;
  let userInfo = await getUserInfo();
  let userId = userInfo.id;
  let isAdmin = false;
  isAdmin = await handleCheckAdmin();

  if (sortByDate) {
    comments = comments.reverse();
  }
  if (sortByLike) {
    comments.sort(function (a, b) {
      return b.likes.length - a.likes.length
    });
  }

  for (i = 0; i < comments.length; i++) {
    userInfo = await getUserInfo();
    userId = userInfo.id;
    let isUsersComment = false;
    if (comments[i].publishedBy === userId) {
      isUsersComment = true;
    }
    const commentCreatedTime = Date.parse(comments[i].createdAt)
    const timeAgo = timeSince(commentCreatedTime)
    const liked = await checkIfUserLikedComment(comments[i]._id, userId);
    const likesAmount = await checkHowMuchLikes(comments[i]._id);
    const fullComment = buildOneComment(comments[i].desc, comments[i].price, comments[i].fName, comments[i].lName, comments[i], timeAgo, comments[i]._id, liked, likesAmount, isUsersComment);
    commentsHtml += fullComment
  }
  app.innerHTML = commentsHtml;
  loadingComments.style.display = 'none';
  const hideCommentsButton = document.querySelector(`.closeComments-${postId}`)
  const sortComments = document.querySelector(`.sortComments-${postId}`)
  hideCommentsButton.style.display = 'block'
  sortComments.style.display = 'flex'
}
const handleHidePostsComments = (postId) => {
  fetch(`/comments/${postId}`).then((res) => res.json()).then(async (data) => {
    if (data.status === "unauthorized") {
      window.location.href = "index.html";
    } else {
      const commentsLength = data.comments.length
      document.querySelector(`.commentArrow-${postId}`).innerHTML = `<span data-id='${postId}' data-comments='${commentsLength}' onclick="handleGetComments('${postId}', 'date')" class="material-icons">arrow_downward</span>
      <p data-id='${postId}' data-comments='${commentsLength}' onclick="handleGetComments('${postId}', 'date')">תגובות: ${commentsLength}</p>`;
      const hideCommentsButton = document.querySelector(`.closeComments-${postId}`)
      hideCommentsButton.style.display = 'none'
      const app = document.querySelector(`.renderComment-${postId}`);
      app.innerHTML = ''
      const sortComments = document.querySelector(`.sortComments-${postId}`)
      sortComments.style.display = 'none'
    }
  });
}
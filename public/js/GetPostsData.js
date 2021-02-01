let canLoadMore = false
let postsOnLoad
let searchedPosts
let blockLoadMore

const getPosts = async () => {
  document.querySelector("#categoryHeder").style.visibility = "hidden";
  document.querySelector("#app").style.visibility = "hidden";
  document.querySelector("#loader").style.visibility = "visible";
  const url = window.location.href
  const params = url.split('?')[1];
  if (params === undefined) {
    window.location.href = "Categories.html"
  } else if (params === 'search') {
    searchedPosts = url.split('?')[2];
    skipLimitPostsBySearched(searchedPosts, 0)
  } else if (params === 'myposts') {
    skipLimitPostsByUser(0)
  } else if (params === 'myfavorites') {
    skipLimitPostsFavorite(0)
    // getUserFavorites()
  } else if (params.includes('admin')) {
    skipLimitPostsForAdminPage(params, 0)
  } else {
    postsOnLoad = await numOfPostsAmountOnLoad(params)
    skipLimitPostsCategory(params, 0)
    // getPostsByCategory(params, 0)
  }
};

const getPostsBySearch = async (searchedPosts) => {

  await fetch(`/posts/search/get/${searchedPosts}`)
    .then((res) => res.json())
    .then(async (data) => {
      let keywords = data.searchedSplitted
      foundPosts = data.foundPosts
      if (data.status === "unauthorized") {
        window.location.href = "index.html"
      } else {

        if (foundPosts.length == 0) {
          renderNoPostsFound(keywords)
        } else {
          renderSearchedPostsTitle(keywords)
        }
      }
    });
  return foundPosts
}
const getPostsByCategory = async (categoryId) => {

  // this is when user clicks category
  fetch("/category/byid", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ categoryId }),
  })
    .then((res) => res.json())
    .then((data) => {
      renderPostsHeder(data.categoryInfo[0].Name, data.categoryInfo[0].img);
    });

  let foundPosts
  // this is when looking for category id
  await fetch(`/posts/get/${categoryId}`)
    .then((res) => res.json())
    .then(async (data) => {
      if (data.status === "unauthorized") {
        window.location.href = "index.html"
      } else {
        foundPosts = data.foundPostsByCategoryId
      }
    });
  return foundPosts
}

const getPostsByUser = async () => {
  const userInfo = await getUserInfo()
  const userFirstName = userInfo.fName
  const userId = userInfo.id

  let foundPosts
  await fetch("/posts/user/get", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  })
    .then((res) => res.json())
    .then(async (data) => {
      if (data.status === "unauthorized") {
        window.location.href = "index.html"
      } else {
        if (!data.ok) {
          console.log('err finding posts')
        } else {
          renderTitleFoundPostsUser(userFirstName)
          foundPosts = data.foundPosts.reverse()
        }
      }
    });
  return foundPosts
}

const getPostsUserIdForAdmin = async (params) => {
  const userId = params.split('=')[1];
  let foundPost
  // let userInfo = await userInfoById(userId)
  await fetch("/posts/admin/user/get", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        console.log('err finding posts')
      } else {
        const username = data.userInfo.username
        renderTitlePostForAdmin(username)
        foundPosts = data.foundPosts
      }
    });
  return foundPosts
}
const getUserFavorites = async () => {
  let user = await getUserWhoPosted()
  const userId = user.id

  let postsToDom = []
  await fetch("/posts/favorites/getall", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "unauthorized") {
        window.location.href = "index.html"
      } else {
        renderTitlePostFavorits()
        let foundPosts = data.favPosts
        foundPosts.forEach(post => {
          postsToDom.push(post[0])
        })
      }
    });
  return postsToDom
}
const checkHowMuchComments = async (postId) => {
  let comments
  await fetch("/comments/length", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "unauthorized") {
        window.location.href = "index.html"
      } else {
        comments = data.commentLength
      }
    });
  return comments
}


const renderPosts = async (postsArray) => {
  let userInfo = await getUserInfo()
  const userId = userInfo.id
  let isAdmin = false
  isAdmin = await handleCheckAdmin();

  const sortedPosts = postsArray

  for (i = 0; i < sortedPosts.length; i++) {
    const isFavorite = await checkIfPostFavorite(sortedPosts[i]._id, userId)
    const commentsLength = await checkHowMuchComments(sortedPosts[i]._id)
    let isUsersPost = false

    const postCreatedTime = Date.parse(sortedPosts[i].createdAt)
    const timeAgo = timeSince(postCreatedTime)

    if (sortedPosts[i].publishedBy === userId) {
      isUsersPost = true
    }
    const html = buildOnePost(
      "post" /*post or comment*/,
      sortedPosts[i].title,
      sortedPosts[i].desc,
      sortedPosts[i].img,
      postCreatedTime,
      timeAgo,
      "0",
      commentsLength,
      sortedPosts[i]._id,
      sortedPosts[i].fName,
      sortedPosts[i].lName,
      isFavorite
    )
    document.getElementById('app').innerHTML += html;
    if (isUsersPost || isAdmin) {
      document.getElementById(`${sortedPosts[i]._id}`).innerHTML =
        `<button class='deletePostButton' style="display:block;" onclick="handleDeletePost(event)">מחק פוסט</button>`
    }
  }
  document.querySelector(
    "#loader").style.display = "none";
  document.querySelector("#categoryHeder").style.visibility = "visible";
  document.querySelector("#app").style.visibility = "visible";

  setTimeout(function () {
    canLoadMore = true
  }, 100)
}


// getPostsByCategory
const getCurrentCategory = () => {
  const url = window.location.href
  const categoryId = url.split('?')[1];
  return categoryId
}
const numOfPostsAmountOnLoad = async (id) => {
  let numOfPostsAmountOnLoad
  await fetch(`/posts/get/${id}`)
    .then((res) => res.json())
    .then(async (data) => {
      if (data.status === "unauthorized") {
        window.location.href = "index.html"
      } else {
        numOfPostsAmountOnLoad = data.foundPostsByCategoryId.length
      }
    });
  return numOfPostsAmountOnLoad
}
const skipLimitPostsCategory = async (categoryId, skip) => {
  setTimeout(function () { blockLoadMore = false; }, 100);
  const foundPosts = await getPostsByCategory(categoryId)
  const popNewPosts = foundPosts.length - postsOnLoad
  foundPosts.reverse()
  const sortedPosts = foundPosts.slice(skip + popNewPosts, popNewPosts + skip + 10)
  renderPosts(sortedPosts)
}
const skipLimitPostsByUser = async (skip) => {
  setTimeout(function () { blockLoadMore = false; }, 100);
  let foundPosts = await getPostsByUser()
  const sortedPosts = foundPosts.slice(skip, skip + 10)
  renderPosts(sortedPosts)
}
const skipLimitPostsFavorite = async (skip) => {
  setTimeout(function () { blockLoadMore = false; }, 100);
  let foundPosts = await getUserFavorites()
  foundPosts.sort(function (a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  const sortedPostsSkip = foundPosts.slice(skip, skip + 10)
  renderPosts(sortedPostsSkip)
}
const skipLimitPostsBySearched = async (searchedWords, skip) => {
  setTimeout(function () { blockLoadMore = false; }, 100);
  let foundPosts = await getPostsBySearch(searchedWords, skip)
  foundPosts.sort(function (a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  const sortedPostsSkip = foundPosts.slice(skip, skip + 10)
  renderPosts(sortedPostsSkip)
}
const skipLimitPostsForAdminPage = async (params, skip) => {
  setTimeout(function () { blockLoadMore = false; }, 100);
  let foundPosts = await getPostsUserIdForAdmin(params)
  foundPosts.reverse()
  const sortedPosts = foundPosts.slice(skip, skip + 10)
  renderPosts(sortedPosts)
}

const loadMoreOnBottom = (function () {
  return function (currentCategory, howMuchToSkip) {
    if (!blockLoadMore) {
      blockLoadMore = true
      const url = window.location.href
      const params = url.split('?')[1];
      if (params === 'myposts') {
        skipLimitPostsByUser(howMuchToSkip)
      } else if (params === 'myfavorites') {
        skipLimitPostsFavorite(howMuchToSkip)
      } else if (params.includes('admin')) {
        skipLimitPostsForAdminPage(params, howMuchToSkip)
      } else if (params === 'search') {
        skipLimitPostsBySearched(searchedPosts, howMuchToSkip)
      } else {
        skipLimitPostsCategory(currentCategory, howMuchToSkip)
      }

    }
  }
})()

window.onscroll = function () {
  if (canLoadMore) {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 650) {
      const howMuchToSkip = document.getElementsByClassName('post').length
      const currentCategory = getCurrentCategory()
      loadMoreOnBottom(currentCategory, howMuchToSkip)
    }
  }

};
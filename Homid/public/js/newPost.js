let postBox = document.querySelector('.newPostBox')
let categoryCheckBox = document.getElementById('category')


const displayPostBox = (e) => {
    e.stopPropagation();
    postBox.style.display = 'block'
    setTimeout(function () {
        postBox.style.opacity = '1'
        postBox.style.transform = 'none'
        getCategoiresCheckBox()

    }, 100);
}
const hideNewPostBox = (e) => {
    postBox.style.opacity = '0'
    postBox.style.transform = 'rotate3d(1, .5, .5, 180deg) scale(0.1)'
    setTimeout(function () {
        postBox.style.display = 'none'
    }, 100);
}

document.onclick = function (e) {

    className = e.target.className
    const classNameInclude = className.includes('box')
    if (!classNameInclude) {
        hideNewPostBox()
    }
}
const getCategoiresCheckBox = () => {
    let categoriesNames = `<option selected value='choseCategory' hidden>בחר קטגוריוה</option>`
    fetch('/category/get')
        .then(res => res.json())
        .then(data => {
            let categories = data.categories
            categories.forEach(category => {
                categoriesNames += `<option data-id='${category._id}' value="${category._id}">${category.Name}</option>`
            })
            categoryCheckBox.innerHTML = categoriesNames
        })
}
const getUserWhoPosted = async () => {
    let id = ''
    await fetch("/userInfo")
        .then((res) => res.json())
        .then((data) => {
            id = data.decoded.id
        });
    return id
};
const handleNewPost = async (e) => {
    e.preventDefault()


    const user = await getUserWhoPosted()
    let categoryId = e.target.children.category.value
    const title = e.target.children.title.value
    const desc = e.target.children.desc.value
    const img = e.target.children.img.value

    if (categoryId === 'choseCategory') {
        categoryId = undefined
    }
    fetch("/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, categoryId, title, desc, img }),
    })
        .then((res) => res.json())
        .then(async (data) => {
            if (!data.posted) {
                await Swal.fire({
                    position: "top-center",
                    icon: "error",
                    title: "אנא לבדוק שכל השדות תקינות",
                    showConfirmButton: false,
                    timer: 1300,
                });
            } else {
                await Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "פוסט פורסם בהצלחה",
                    showConfirmButton: false,
                    timer: 2000,
                });
                hideNewPostBox()

                window.location.replace(`/posts/${categoryId}`)
            }
        });
}

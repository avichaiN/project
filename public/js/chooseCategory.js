const startLoad = () => {
  getDisplayCategories();
};

// get all categories when loading page
const getDisplayCategories = () => {
  fetch("/category/get")
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "unauthorized") {
        window.location.href = "index.html";
      } else {
        let categories = data.categories;
        writeCategoiresToDom(categories);
      }
    });
};

const writeCategoiresToDom = (categories) => {
  const categoryDiv = document.querySelector(".cateogryPage__categorys");
  let categoriesHtml = "";

  categories.forEach((category) => {
    categoriesHtml += `<div onclick="goToClickedCategory(event)" class="cateogryPage__categorysBox" data-name='${category.Name}' data-id='${category._id}'>
        <div class="cateogryPage__categorysBoxContainer" /* data-img='${category.img}' data-name='${category.Name}' data-id='${category._id}' */>
        <img src="data:image/jpg;base64,${category.img}" />
            <h4>${category.Name}</h4>
            <button onclick='deleteCategory(event)' style="display: none;" class="deleteCategory">מחק</button>
            <!-- add menu of edit cateogry -->
            <button onclick='editCategoryForm(event)' style="display: none;" class="editCategory">ערוך</button>
        </div>
    </div>`;
  });
  document.querySelector("#loader").style.display = "none";
  categoryDiv.innerHTML = categoriesHtml;
  displayAdminCategory();
};
const displayAdminCategory = async () => {
  let checkAdmin = await handleCheckAdmin();

  if (checkAdmin) {
    document.querySelector(".category__admin").style.display = "block";
  }
};

// go to clicked category
const goToClickedCategory = (e) => {
  let chosenCategoryId = e.target.dataset.id;
  if (chosenCategoryId === undefined) {
    chosenCategoryId = e.target.parentNode.dataset.id;
  }
  window.location.href = `/posts.html?${chosenCategoryId}`;
};

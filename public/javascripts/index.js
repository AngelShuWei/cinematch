console.log('hi')
const collectionButtons = document.querySelectorAll('.collectionId')

for (let i = 0; i < collectionButtons.length; i++) {
  const collectionButton = collectionButtons[i]

  collectionButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const id = e.target.id;
    console.log('COLLECTION ID -----------------', id);

    const res = await fetch(`/collections/${id}`, {
      method: 'DELETE'
    });

    let success = await res.json()

    if (success.message === 'Success') {
      const container = document.querySelector(`#container-${id}`)
      container.remove();
    }

  });

}




// const reviewButtons = document.querySelectorAll('.reviewBtn')

// for (let i = 0; i < reviewButtons.length; i++) {
//   const reviewButton = reviewButtons[i]

//   reviewButton.addEventListener("click", async (e) => {
//     e.preventDefault();
//     const reviewString = e.target.id; //review1
//     console.log('review string -----------------', reviewString);

//     const stringId = reviewString.split('');
//     console.log('stringId-----------------', stringId);

//     const stringId2 = stringId[stringId.length - 1]

//     const id = parseInt(stringId2, 10);

//     console.log('review ID -----------------', id);

//     const res = await fetch(`/reviews/${id}`, {
//       method: 'DELETE'
//     });

//     let success = await res.json()

//     if (success.message === 'Success') {
//       const container = document.querySelector(`#indiv-review-${id}`)
//       container.remove();
//     }

//   });

// }



// const deleteBtns = document.querySelectorAll('.delete-btn')

// for (let i = 0; i < deleteBtns.length; i++) {
//   const btn = deleteBtns[i];
//   // Task 24c
//   btn.addEventListener('click', async (e) => {
//     e.preventDefault()
//     const postId = e.target.id
//     console.log(postId)
//     const res = await fetch(`/posts/${postId}`, {
//       method: 'DELETE'
//     })

//     // Task 24e
//     const data = await res.json()
//     console.log(data)

//     if (data.message === "Success") {
//       const container = document.querySelector(`#post-container-${postId}`)
//       container.remove()
//     } else {

//     }
//   })
// // }

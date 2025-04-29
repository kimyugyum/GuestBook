document.addEventListener('DOMContentLoaded', async function () {
  const form = document.getElementById('guestbook-form');
  const guestbookEntries = document.getElementById('guestbook-entries');
  const BASE_URL = 'http://3.38.74.127:8000/guestbook/';

  // 방명록 불러오기
  async function fetchGuestbooks() {
    const res = await fetch(BASE_URL);
    const json = await res.json();
    if (json.status === 200) {
      guestbookEntries.innerHTML = ''; // 초기화
      json.data.reverse().forEach(entry => {
        const item = createGuestbookItem(entry.id, entry.title, entry.guest, entry.content, entry.created);
        guestbookEntries.appendChild(item);
      });
    } else {
      alert('방명록을 불러오지 못했습니다.');
    }
  }

  // 방명록 작성
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const guest = document.getElementById('author').value.trim();
    const content = document.getElementById('content').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!title || !guest || !content || !password) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        guest: guest,
        content: content,
        password: password
      })
    });

    const result = await response.json();

    if (result.status === 200) {
      alert('방명록 작성 완료!');
      await fetchGuestbooks(); // 새로고침 없이 바로 갱신
      form.reset();
    } else {
      alert(result.message || '작성 실패');
    }
  });

  // 방명록 항목 생성 함수
  function createGuestbookItem(id, title, guest, content, created) {
    const item = document.createElement('div');
    item.className = 'guestbook-item';

    // 랜덤 배경색
    const bgColors = ['#4c7a5a', '#558866', '#5f9673', '#6aa580', '#77b48d'];
    const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];
    item.style.backgroundColor = randomColor;

    item.innerHTML = `
      <h3>${title}</h3>
      <p><strong>작성자:</strong> ${guest}</p>
      <p><strong>작성 시간:</strong> ${created}</p>
      <p>${content}</p>
      <button class="delete-btn">삭제</button>
    `;

    const deleteBtn = item.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async function () {
      const inputPassword = prompt('비밀번호를 입력하세요');
      if (!inputPassword) {
        alert('비밀번호를 입력해야 삭제할 수 있습니다.');
        return;
      }

      const res = await fetch(`${BASE_URL}${id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPassword })
      });

      const json = await res.json();

      if (json.status === 200) {
        alert('삭제되었습니다.');
        await fetchGuestbooks(); // 리스트 갱신
      } else {
        alert(json.message || '삭제 실패');
      }
    });

    return item;
  }

  // 페이지 로딩 시 방명록 불러오기
  fetchGuestbooks();
});

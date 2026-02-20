import React, { useEffect, useState } from "react";
import '../css/salecount.css';

function Salecount({ count, onCountChange, remainingSeats}) {
  // const [saleCount, setSaleCount] = useState(1); // 예약 인원

  const handlePlus = () => {
    // 남은 좌석 정보가 있고, 초과하려고 하면 막기
    if (remainingSeats !== null && count + 1 > remainingSeats) {
      alert("남은 좌석보다 많이 선택할 수 없습니다.");
      return;
    }
    onCountChange(count + 1);
  }
  const handleMinus = () => count > 1 && onCountChange(count - 1);

  //  saleCount가 바뀔 때마다 부모에 알림
  // useEffect(() => {
  //   onCountChange?.(count);
  // }, [saleCount]);

  return (
    <div className="guest-wrapper">
      <div className="counter">
        <div className="control">
          <button onClick={handleMinus}><i className="fas fa-minus"></i></button>
          <span className="saleCounttxt">{count}</span>
          <button onClick={handlePlus}><i className="fas fa-plus"></i></button>
        </div>
      </div>
    </div>
  );
}

export default Salecount;

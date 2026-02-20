import { Navigate, Outlet } from "react-router-dom";
import jaxios from "../../util/JWTutil";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function AdminRoute() {
    const loginUser = useSelector(state => state.user);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(
        () => {
            if (!loginUser || !loginUser.userid) {
                setLoading(false);
                setIsAdmin(false);
                return;
            }

            // 서버에 role = ADMIN 검증 요청
            jaxios.get('/api/member/checkAdmin')
            .then(res => setIsAdmin(res.data.isAdmin))
            .catch(() => setIsAdmin(false))
            .finally(() => setLoading(false));
        }, [loginUser]
    );

    if (loading) return <p>Loading...</p>;
    if (!loginUser || !isAdmin) return <Navigate to="/notAuthorized" />;

    return <Outlet />; // 권한 체크 통과하면 하위 admin 컴포넌트 렌더링
}
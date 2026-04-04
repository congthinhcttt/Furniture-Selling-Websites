import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../api/authApi";
import { getAdminAccounts, updateAdminAccountRole } from "../../api/adminAccountApi";
import Pagination from "../../components/common/Pagination";
import type { AdminAccount } from "../../types/adminAccount";
import { clampPage, getTotalPages, paginateItems } from "../../utils/pagination";

const roleOptions = ["USER", "ADMIN"];
const ADMIN_ACCOUNTS_PER_PAGE = 10;

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAccountId, setPendingAccountId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError("");
        setAccounts(await getAdminAccounts());
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể tải danh sách tài khoản."));
      } finally {
        setLoading(false);
      }
    };

    void fetchAccounts();
  }, []);

  const totalPages = getTotalPages(accounts.length, ADMIN_ACCOUNTS_PER_PAGE);
  const safePage = clampPage(currentPage, totalPages);
  const paginatedAccounts = paginateItems(accounts, safePage, ADMIN_ACCOUNTS_PER_PAGE);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const handleRoleChange = async (accountId: number, role: string) => {
    try {
      setPendingAccountId(accountId);
      setError("");
      const updated = await updateAdminAccountRole(accountId, role);
      setAccounts((current) =>
        current.map((account) => (account.id === accountId ? updated : account))
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể cập nhật vai trò tài khoản."));
    } finally {
      setPendingAccountId(null);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Tài khoản</p>
          <h1 className="admin-page-title">Quản lý tài khoản</h1>
          <p className="admin-page-desc">
            Theo dõi danh sách tài khoản và cập nhật vai trò USER / ADMIN.
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Danh sách tài khoản</h2>
        </div>

        {loading ? (
          <div className="admin-empty-state">Đang tải tài khoản...</div>
        ) : error ? (
          <div className="admin-empty-state">{error}</div>
        ) : accounts.length === 0 ? (
          <div className="admin-empty-state">Chưa có tài khoản nào.</div>
        ) : (
          <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tài khoản</th>
                  <th>Vai trò</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAccounts.map((account) => (
                  <tr key={account.id}>
                    <td>#{account.id}</td>
                    <td>{account.loginName}</td>
                    <td>
                      <select
                        className="form-select admin-select"
                        value={account.role}
                        disabled={pendingAccountId === account.id}
                        onChange={(event) => handleRoleChange(account.id, event.target.value)}
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          </>
        )}
      </div>
    </section>
  );
}

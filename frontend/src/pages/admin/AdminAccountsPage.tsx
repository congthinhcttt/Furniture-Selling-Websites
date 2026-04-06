import { type ChangeEvent, useEffect, useMemo, useState } from "react";
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    keyword: "",
    role: "",
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError("");
        setAccounts(await getAdminAccounts());
      } catch (err) {
        setError(getApiErrorMessage(err, "Khong the tai danh sach tai khoan."));
      } finally {
        setLoading(false);
      }
    };

    void fetchAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchesKeyword =
        !keyword ||
        account.loginName.toLowerCase().includes(keyword) ||
        String(account.id).includes(keyword) ||
        (account.referralCode || "").toLowerCase().includes(keyword);
      const matchesRole = !filters.role || account.role === filters.role;
      return matchesKeyword && matchesRole;
    });
  }, [accounts, filters]);

  const totalPages = getTotalPages(filteredAccounts.length, ADMIN_ACCOUNTS_PER_PAGE);
  const safePage = clampPage(currentPage, totalPages);
  const paginatedAccounts = paginateItems(filteredAccounts, safePage, ADMIN_ACCOUNTS_PER_PAGE);

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
      setAccounts((current) => current.map((account) => (account.id === accountId ? updated : account)));
    } catch (err) {
      setError(getApiErrorMessage(err, "Khong the cap nhat vai tro tai khoan."));
    } finally {
      setPendingAccountId(null);
    }
  };

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
    setCurrentPage(1);
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Tai khoan</p>
          <h1 className="admin-page-title">Quan ly tai khoan</h1>
          <p className="admin-page-desc">Theo doi referral code, nguoi gioi thieu va so luot gioi thieu thanh cong.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Danh sach tai khoan</h2>
          <div className="admin-panel-actions">
            <button type="button" className="btn btn-domora-outline" onClick={() => setIsFilterOpen((current) => !current)}>
              Loc
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="admin-filter-panel">
            <input
              className="form-control"
              name="keyword"
              value={filters.keyword}
              placeholder="Tim theo id, ten dang nhap, ma gioi thieu"
              onChange={handleFilterChange}
            />
            <select className="form-select" name="role" value={filters.role} onChange={handleFilterChange}>
              <option value="">Tat ca vai tro</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="admin-empty-state">Dang tai tai khoan...</div>
        ) : error ? (
          <div className="admin-empty-state">{error}</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="admin-empty-state">Khong co tai khoan phu hop.</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tai khoan</th>
                    <th>Ma gioi thieu</th>
                    <th>ID nguoi gioi thieu</th>
                    <th>So luot gioi thieu</th>
                    <th>Vai tro</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAccounts.map((account) => (
                    <tr key={account.id}>
                      <td>#{account.id}</td>
                      <td>{account.loginName}</td>
                      <td>{account.referralCode || "-"}</td>
                      <td>{account.referredByUserId ?? "-"}</td>
                      <td>{account.successfulReferralCount ?? 0}</td>
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
            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    </section>
  );
}

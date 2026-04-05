import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { API_BASE_URL } from "../../config/runtime";
import {
  changeCurrentUserPassword,
  getApiErrorMessage,
  updateCurrentUserProfile,
  uploadCurrentUserAvatar,
} from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import type { UserProfile } from "../../types/auth";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function resolveAvatarUrl(value?: string) {
  if (!value) {
    return "";
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`;
  }
  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
}

export default function AccountProfilePage() {
  const { auth, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [basicForm, setBasicForm] = useState({
    fullName: auth?.fullName || "",
    email: auth?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [avatarMessage, setAvatarMessage] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setBasicForm({
      fullName: auth?.fullName || "",
      email: auth?.email || "",
    });
  }, [auth?.fullName, auth?.email]);

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    []
  );

  const isLocalAccount = (auth?.authProvider || "LOCAL").toUpperCase() === "LOCAL";
  const currentAvatar = resolveAvatarUrl(auth?.avatarUrl);
  const displayAvatar = avatarPreviewUrl || currentAvatar;

  const syncAuthState = (profile: UserProfile) => {
    if (!auth) {
      return;
    }

    const persist = localStorage.getItem("auth") !== null;
    login(
      {
        ...auth,
        fullName: profile.fullName || "",
        email: profile.email || "",
        avatarUrl: resolveAvatarUrl(profile.avatarUrl),
        role: profile.role || auth.role,
        authProvider: profile.authProvider || auth.authProvider || "LOCAL",
      },
      persist
    );
  };

  const resetAvatarSelection = () => {
    setAvatarFile(null);
    setAvatarPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setPasswordMessage("");
  };

  const handleBasicInfoSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSavingProfile(true);
      setProfileError("");
      setProfileMessage("");

      const profile = await updateCurrentUserProfile({
        fullName: basicForm.fullName.trim(),
        email: basicForm.email.trim(),
      });

      syncAuthState(profile);
      setProfileMessage("Đã cập nhật thông tin cá nhân.");
    } catch (error) {
      setProfileError(getApiErrorMessage(error, "Không thể cập nhật thông tin cá nhân."));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setAvatarError("");
    setAvatarMessage("");

    if (!file) {
      resetAvatarSelection();
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type.toLowerCase())) {
      setAvatarError("Ảnh không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG, WEBP.");
      resetAvatarSelection();
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("Dung lượng ảnh tối đa 2MB.");
      resetAvatarSelection();
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setAvatarFile(file);
    setAvatarPreviewUrl(objectUrl);
  };

  const handleAvatarSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!avatarFile) {
      setAvatarError("Vui lòng chọn ảnh trước khi cập nhật.");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setAvatarError("");
      setAvatarMessage("");

      const profile = await uploadCurrentUserAvatar(avatarFile);
      syncAuthState(profile);
      setAvatarMessage("Đã cập nhật hình đại diện.");
      resetAvatarSelection();
    } catch (error) {
      setAvatarError(getApiErrorMessage(error, "Không thể cập nhật hình đại diện."));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleTogglePassword = () => {
    setIsPasswordExpanded((current) => {
      if (current) {
        resetPasswordForm();
      }
      return !current;
    });
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Vui lòng nhập đầy đủ thông tin mật khẩu.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      setIsSavingPassword(true);
      setPasswordError("");
      setPasswordMessage("");

      await changeCurrentUserPassword(passwordForm);
      setPasswordMessage("Đổi mật khẩu thành công.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(getApiErrorMessage(error, "Không thể đổi mật khẩu."));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <section className="info-page">
      <div className="account-hero">
        <div className="container">
          <div className="account-hero-shell">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="account-avatar account-avatar-image" />
            ) : (
              <div className="account-avatar">{auth?.username?.slice(0, 1).toUpperCase() || "D"}</div>
            )}

            <div>
              <p className="account-hero-kicker">Tài khoản DOMORA</p>
              <h1 className="account-hero-title">{auth?.fullName || auth?.username || "Người dùng"}</h1>
              <p className="account-hero-desc">Quản lý thông tin cá nhân, hình đại diện và bảo mật tài khoản.</p>
            </div>

            <div className="account-hero-badge">{auth?.role || "USER"}</div>
          </div>
        </div>
      </div>

      <div className="container info-page-section">
        <div className="account-profile-layout">
          <article className="info-card info-card-large account-profile-card">
            <div className="account-section-heading account-section-heading-tight">
              <div>
                <p className="account-section-kicker">Thông tin cơ bản</p>
                <h2>Thông tin tài khoản</h2>
              </div>
            </div>

            {(profileMessage || profileError) && (
              <div className={`account-feedback ${profileError ? "error" : "success"}`}>
                {profileError || profileMessage}
              </div>
            )}

            <form className="account-profile-form" onSubmit={handleBasicInfoSubmit}>
              <div className="account-profile-row">
                <label className="account-grid-label">Tên đăng nhập</label>
                <input className="form-control" value={auth?.username || ""} disabled />
              </div>
              <div className="account-profile-row">
                <label className="account-grid-label">Vai trò</label>
                <input className="form-control" value={auth?.role || "USER"} disabled />
              </div>
              <div className="account-profile-row">
                <label className="account-grid-label">Họ tên</label>
                <input
                  className="form-control"
                  value={basicForm.fullName}
                  onChange={(event) => setBasicForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Nhập họ tên"
                />
              </div>
              <div className="account-profile-row">
                <label className="account-grid-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={basicForm.email}
                  onChange={(event) => setBasicForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Nhập email"
                />
              </div>
              <div className="account-form-actions">
                <button type="submit" className="btn btn-domora" disabled={isSavingProfile}>
                  {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </article>

          <div className="account-profile-side">
            <article className="info-card info-card-large account-profile-card">
              <div className="account-section-heading account-section-heading-tight">
                <div>
                  <p className="account-section-kicker">Avatar</p>
                  <h2>Hình đại diện</h2>
                </div>
              </div>

              {(avatarMessage || avatarError) && (
                <div className={`account-feedback ${avatarError ? "error" : "success"}`}>
                  {avatarError || avatarMessage}
                </div>
              )}

              <form className="account-avatar-form" onSubmit={handleAvatarSubmit}>
                <div className="account-avatar-preview">
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="Avatar preview" className="account-avatar account-avatar-image" />
                  ) : (
                    <div className="account-avatar">{auth?.username?.slice(0, 1).toUpperCase() || "D"}</div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="d-none"
                  onChange={handleAvatarFileChange}
                />

                <div className="account-avatar-actions">
                  <button
                    type="button"
                    className="btn btn-domora-outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Chọn ảnh
                  </button>
                  <button type="submit" className="btn btn-domora" disabled={isUploadingAvatar || !avatarFile}>
                    {isUploadingAvatar ? "Đang cập nhật..." : "Cập nhật hình đại diện"}
                  </button>
                </div>

                <p className="account-avatar-hint">Định dạng hỗ trợ: JPG, JPEG, PNG, WEBP. Tối đa 2MB.</p>
              </form>
            </article>

            <article className="info-card info-card-large account-profile-card">
              <div className="account-section-heading account-section-heading-tight">
                <div>
                  <p className="account-section-kicker">Bảo mật</p>
                  <h2>Mật khẩu</h2>
                </div>
                {isLocalAccount && (
                  <button type="button" className="btn btn-domora-outline btn-sm" onClick={handleTogglePassword}>
                    {isPasswordExpanded ? "Đóng" : "Đổi mật khẩu"}
                  </button>
                )}
              </div>

              {!isLocalAccount && (
                <div className="account-security-note">
                  Tài khoản này đang đăng nhập bằng social ({auth?.authProvider || "GOOGLE"}), không đổi mật khẩu tại
                  đây.
                </div>
              )}

              {isLocalAccount && isPasswordExpanded && (
                <>
                  {(passwordMessage || passwordError) && (
                    <div className={`account-feedback ${passwordError ? "error" : "success"}`}>
                      {passwordError || passwordMessage}
                    </div>
                  )}

                  <form className="account-profile-form account-password-form" onSubmit={handlePasswordSubmit}>
                    <div className="account-profile-row">
                      <label className="account-grid-label">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordForm.currentPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                        }
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                    </div>

                    <div className="account-profile-row">
                      <label className="account-grid-label">Mật khẩu mới</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                        }
                        placeholder="Nhập mật khẩu mới"
                      />
                    </div>

                    <div className="account-profile-row">
                      <label className="account-grid-label">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordForm.confirmPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                        }
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>

                    <div className="account-form-actions">
                      <button type="submit" className="btn btn-domora" disabled={isSavingPassword}>
                        {isSavingPassword ? "Đang đổi..." : "Xác nhận đổi mật khẩu"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

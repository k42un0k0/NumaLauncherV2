type Props = {
  selected: boolean;
  onClickSelect: (uuid: string) => void;
  onClickLogout: (uuid: string) => void;
  displayName: string;
  uuid: string;
};
export default function AccountItem({
  displayName,
  uuid,
  selected,
  onClickSelect,
}: Props) {
  return (
    <div>
      <div>
        <img
          alt={displayName}
          src={`https://crafatar.com/renders/body/${uuid}?scale=3&default=MHF_Steve&overlay`}
        />
      </div>
      <div>
        <div>
          <div>Username</div>
          <div>{displayName}</div>
        </div>
        <div>UUID</div>
        <div>{uuid}</div>
      </div>
      <div>
        {selected ? (
          <div>
            選択中のアカウント
          </div>
        ) : (
          <button onClick={() => onClickSelect(uuid)}>
            このアカウントを選択する
          </button>
        )}
      </div>
    </div>
  );
}

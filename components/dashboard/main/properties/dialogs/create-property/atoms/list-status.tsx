type Props = {
  length: number;
  hasNext: boolean;
  label: string;
  isInitialLoading?: boolean;
};

const ListStatus = ({ length, hasNext, label, isInitialLoading }: Props) => (
  <>
    {!isInitialLoading && length > 0 && (
      <div className="py-2 text-center text-xs text-muted-foreground">
        {hasNext ? `Loading more ${label}...` : `All ${label} loaded`}
      </div>
    )}
  </>
);

export default ListStatus;

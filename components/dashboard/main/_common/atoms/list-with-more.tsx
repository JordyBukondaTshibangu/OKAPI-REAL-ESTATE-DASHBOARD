import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ListProps = {
  entities: { entityId: string; entityName: string }[];
  count: number;
};
function ListWithMore({ entities, count }: ListProps) {
  if (!entities || !count) return null;

  const maxDisplay = 5;
  const displayed = entities?.slice(0, maxDisplay);
  const remaining = count - displayed.length;

  return (
    <ul className="mt-1 flex flex-col gap-1 px-6 list-disc">
      {displayed.map(({ entityId, entityName }) => (
        <li key={entityId} className="text-sm font-semibold text-foreground">
          {entityName}
        </li>
      ))}

      {remaining > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <p className="text-sm text-muted-foreground font-medium underline cursor-pointer">
              and {remaining} more
            </p>
          </PopoverTrigger>

          <PopoverContent className="w-48 -translate-y-1 -translate-x-1/2">
            <p className="text-sm font-normal text-popover-foreground mb-2 opacity-50">
              All affected entities:
            </p>

            <div className="space-y-1">
              {entities.slice(maxDisplay).map(({ entityId, entityName }) => (
                <p
                  key={entityId}
                  className="text-sm text-popover-foreground hover:bg-muted rounded-md  py-1 cursor-default"
                >
                  {entityName}
                </p>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </ul>
  );
}

export default ListWithMore;

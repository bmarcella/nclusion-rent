/* eslint-disable @typescript-eslint/no-explicit-any */
import { Select } from '@/components/ui/Select';
import { manageAuth } from '@/constants/roles.constant';
import {  getRegionsLabelvalue, RegionType } from '@/views/Entity/Regions';
import { useEffect, useState } from 'react';

interface OptionType {
  label: string;
  value: string | number;
}

interface Props {
  authority: string[];
  proprio: any;
  t: (key: string) => string;
  onChangeRegion: (payload:  number[]) => void;
  onChangeRole: (role: string[] ) => void;
}

export const convertToSelectOptionsRegion = (items: RegionType[]) => {
  return items.map((obj) => ({
    value: obj.value,
    label: obj.name,
  }))
}


function FilterProprio({ authority, proprio, t, onChangeRegion, onChangeRole }: Props) {
  const [regions, setRegions] = useState<OptionType[]>([]);
  const [roles, setRoles] = useState<OptionType[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<OptionType[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<OptionType>();

  useEffect(() => {
    if (!authority?.length) return;

    const fetchData = async () => {
      const { regions, roles } = await manageAuth(authority[0], proprio, t);
      setRegions(convertToSelectOptionsRegion(regions));
      roles.unshift({ label: 'All', value: undefined });
      setRoles(roles);
    };

    fetchData();
  }, [authority, proprio, t]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded">
      {roles.length > 0 && (
        <Select
          placeholder="Role"
          options={roles}
          onChange={(options: OptionType) => {
            onChangeRole(undefined);
            if (!options) {
                setSelectedRoles(undefined);
                onChangeRole(undefined);
                return;
              }
             setSelectedRoles(options);
            onChangeRole(options.value as string);
          }}
        />
      )}

      {regions.length > 0 && (
        <Select
          isMulti
          placeholder="Region"
          options={regions}
          onChange={(options: OptionType[]) => {

            if (!options || options.length === 0) {
                setSelectedRegions([]);
                onChangeRegion([]);
                return;
              }
            
            setSelectedRegions(options);
            const ids = getRegionsLabelvalue(options);
            onChangeRegion(ids);
          }}
        />
      )}
    </div>
  );
}

export default FilterProprio;

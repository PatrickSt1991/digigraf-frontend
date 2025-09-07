import { useLocation, useParams } from "react-router-dom";
import { DashboardLayout, FormCard, FormField, FuneralForm, TitleCard } from "../../components";
import { useDropdownData, useFormHandler, useSaveAndNext } from "../../hooks";
import { endpoints } from "../../api/apiConfig";

export default function FuneralDeceased() {
    const location = useLocation();
    const { overledeneId } = useParams();

    const {
        formData,
        handleChange,
        goNext,
        goBack,
        loading: formLoading,
        error: formError,
    } = useFormHandler({
        initialData: {
            condolences: "",
            dateCondolences: "",
            timeCondolences: "",
            condolencesConsumptions: "",
            funeralType: "",
            cemetery: "",
            auditorium: "",
            persons: "",
            graveNumber: "",
            dateFuneral: "",
            timeFuneral: "",
            funeralLocation: "",
            serviceLocation: "",
            serviceDate: "",
            serviceTime: "",
            coffinUpDown: "",
            sayGoodbye: "",
            followCars: "",
            private: "",
            speaker: "",
            powerpoint: "",
            serviceConsumptions: "",
            music: "",
            ashDestination: "",
            graveType: "",
            existingGrave: "",
            sandGrave: "",
            graveMonument: "",
            funeralLeader: "",
            funeralNumber: "",
        },
        steps: ["/deceased-layout", "/deceased-funeral", "/deceased-documents", "/success-deceased"],
        fetchUrl: overledeneId ? `${endpoints.deceased}/${overledeneId}` : undefined,
    });

    const saveurl = overledeneId
      ? `${endpoints.funeral}?overledeneId=${overledeneId}`
      : endpoints.funeral;

    const handleNext = useSaveAndNext({
        formData,
        endpoint: saveurl,
        id: overledeneId,
        goNext,
    });

    const { data, loading: dropdownLoading, errors: dropdownErrors } = useDropdownData({
        salutations: endpoints.salutation,
    });

    return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">

        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onNext={() => goNext(location.pathname)} //handleNext = prod
          onBack={() => goBack(location.pathname)}
          readOnly={true}
        />

        {formLoading && <div>Gegevens laden...</div>}
        {formError && <div className="text-red-600">{ formError }</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <FormCard title="">
            <TitleCard title="Condoleance Informatie"/>
            <FormField label="Condoleance">
              <select
                name="condoleances"
                value={formData.condolences}
                onChange={handleChange}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              >
                <option value="">Selecteer een optie...</option>
                <option value="ja">Ja</option>
                <option value="nee">Nee</option>
                <option value="onbekend">Onbekend</option>
              </select>
            </FormField>
            <FormField label="Datum" type="date" name="dateCondoleances" value={formData.dateCondolences} onChange={handleChange} />
            <FormField label="Tijd" type="time" name="timeCondoleances" value={formData.timeCondolences} onChange={handleChange} />
            <FormField label="Consumpties" name="condolencesConsumptions" value={formData.condolencesConsumptions} onChange={handleChange} />
            <TitleCard title="Uitvaart Informatie" className="pt-4"/>
            <FormField label="Begrafenis / Crematie" name="funeralType" value={formData.funeralType} onChange={handleChange} />
            <FormField label="Begraafplaats" name="firstparent" value={formData.cemetery} onChange={handleChange} />
            <FormField label="Graf nummer" name="graveNumber" value={formData.graveNumber} onChange={handleChange} />
            <FormField label="Aula (naam)" name="auditorium" value={formData.auditorium} onChange={handleChange} />
            <FormField label="Aantal personen" name="persons" value={formData.persons} onChange={handleChange} />
            <FormField label="Datum" type="date" name="dateFuneral" value={formData.dateFuneral} onChange={handleChange} />
            <FormField label="Tijd" type="time" name="timeFuneral" value={formData.timeFuneral} onChange={handleChange} />
            <FormField label="Uitvaarte te" required name="funeralLocation" value={formData.funeralLocation} onChange={handleChange} />
          </FormCard>

          {/* Right Column */}
          <FormCard title="">
            <TitleCard title="Dienst Informatie"/>
            <FormField label="Dienst te" name="serviceLocation" value={formData.serviceLocation} onChange={handleChange} />
            <FormField label="Datum" type="date" name="serviceDate" value={formData.serviceDate} onChange={handleChange} />
            <FormField label="Tijd" type="time" name="serviceTime" value={formData.serviceTime} onChange={handleChange} />
            <FormField label="Kist staan / dalen" required>
              {dropdownLoading.coffinservice ? (
                <div>Loading...</div>
              ) : dropdownErrors.coffinservice ? (
                <div className="text-red-600">{ dropdownErrors.coffinservice }</div>
              ) : (
                <select
                  name="coffinUpDown"
                  value={formData.coffinUpDown}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer een optie...</option>
                  {data.salutations?.map((s: any) => (
                    <option key={s.id} value={s.code}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
            <FormField label="Afscheid nemen" required name="sayGoodbye" value={formData.sayGoodbye} onChange={handleChange} />
            <FormField label="Aantal volgauto's" required name="followCars" value={formData.followCars} onChange={handleChange} />
            <FormField label="Besloten kring" required name="private" value={formData.private} onChange={handleChange} />
            <FormField label="Spreker" name="speaker" value={formData.speaker} onChange={handleChange} />
            <FormField label="PowerPoint"  name="powerpoint" value={formData.powerpoint} onChange={handleChange} />
            <FormField label="Consumpties" name="serviceConsumptions" value={formData.serviceConsumptions} onChange={handleChange} />
            <FormField label="Muziekstuk" required name="music" value={formData.music} onChange={handleChange} />
            <TitleCard title="Asbestemming Informatie" className="pt-4"/>
            <FormField label="Asbestemming">
              {dropdownLoading.ashdestinations ? (
                <div>Loading...</div>
              ) : dropdownErrors.ashdestinations ? (
                <div className="text-red-600">{ dropdownErrors.ashdestinations }</div>
              ) : (
                <select
                  name="coffinUpDown"
                  value={formData.ashDestination}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer een optie...</option>
                  {data.salutations?.map((s: any) => (
                    <option key={s.id} value={s.code}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
            <FormField label="Graf type">
              {dropdownLoading.gravetypes ? (
                <div>Loading...</div>
              ) : dropdownErrors.gravetypes ? (
                <div className="text-red-600">{ dropdownErrors.gravetypes }</div>
              ) : (
                <select
                  name="coffinUpDown"
                  value={formData.graveType}
                  onChange={handleChange}
                  className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                >
                  <option value="">Selecteer een optie...</option>
                  {data.salutations?.map((s: any) => (
                    <option key={s.id} value={s.code}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
            <FormField label="Bestaand graf">
              <select
                name="existingGrave"
                value={formData.existingGrave}
                onChange={handleChange}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              >
                <option value="">Selecteer een optie...</option>
                <option value="ja">Ja</option>
                <option value="nee">Nee</option>
                <option value="onbekend">Onbekend</option>
              </select>
            </FormField>
            <FormField label="Zand / Kelder graf">
              <select
                name="sandGrave"
                value={formData.sandGrave}
                onChange={handleChange}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              >
                <option value="">Selecteer een optie...</option>
                <option value="zand">Zand</option>
                <option value="kelder">Kelder</option>
                <option value="onbekend">Onbekend</option>
              </select>
            </FormField>
            <FormField label="Grafmonument">
              <select
                name="graveMonument"
                value={formData.graveMonument}
                onChange={handleChange}
                className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
              >
                <option value="">Selecteer een optie...</option>
                <option value="ja">Ja</option>
                <option value="nee">Nee</option>
                <option value="onbekend">Onbekend</option>
              </select>
            </FormField>
          </FormCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
import React from 'react';
import type { RentalAgreementData } from '../../types/documents';
import {
    numberToWords,
    formatCurrency,
    formatDatePL,
    validatePesel,
} from '../../shared/utils';

interface RentalAgreementPreviewProps {
    data: RentalAgreementData;
    logoSrc?: string;
    variant?: 'default' | 'print';
}

export const RentalAgreementPreview: React.FC<RentalAgreementPreviewProps> = ({
    data,
    logoSrc,
    variant = 'default',
}) => {
    const monthlyRent = parseFloat(data.monthlyRent.replace(',', '.')) || 0;
    const vatRate = parseInt(data.monthlyRentVatRate || '23');
    const grossRent = monthlyRent * (1 + vatRate / 100);
    const deposit = parseFloat(data.deposit.replace(',', '.')) || 0;

    const landlordPeselValid = data.landlordPesel ? validatePesel(data.landlordPesel).isValid : false;
    const tenantPeselValid = data.tenantPesel ? validatePesel(data.tenantPesel).isValid : false;

    const isIndefinite = !data.endDate || data.endDate === '';
    const startDateFormatted = formatDatePL(data.startDate);
    const endDateFormatted = formatDatePL(data.endDate);
    const conclusionDateFormatted = formatDatePL(data.conclusionDate);

    return (
        <div
            className={`
        contract-preview bg-white 
        ${variant === 'print' ? 'p-[2cm]' : 'p-[30px] shadow-card'}
      `}
            style={{
                minHeight: '297mm',
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '11pt',
                lineHeight: 1.5,
                position: 'relative',
            }}
        >
            {/* Watermark Logo */}
            {logoSrc && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                        opacity: 0.07,
                        zIndex: 1,
                        pointerEvents: 'none',
                        width: '80%',
                        textAlign: 'center',
                    }}
                >
                    <img
                        src={logoSrc}
                        alt="Watermark"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            filter: 'grayscale(100%)',
                        }}
                    />
                </div>
            )}

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                <h1 style={{
                    fontSize: '18pt',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '8px',
                    color: '#1e1e1e',
                    borderBottom: '2px solid #7c6a3e',
                    paddingBottom: '12px',
                }}>
                    UMOWA NAJMU LOKALU
                </h1>
                {data.contractNumber && (
                    <div style={{
                        fontSize: '10pt',
                        color: '#7c6a3e',
                        fontWeight: 600,
                        marginTop: '4px',
                        fontFamily: 'monospace',
                    }}>
                        Nr: {data.contractNumber}
                    </div>
                )}
            </div>

            {/* Introduction */}
            <div style={{ marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                <p>
                    Umowa zawarta w dniu <strong>{conclusionDateFormatted || '__.__.____'}</strong> r.,
                    w <strong>{data.place || '________________'}</strong>, pomiędzy:
                </p>
            </div>

            {/* Landlord */}
            <div style={{ paddingLeft: '24px', marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                <p><strong style={{ fontSize: '12pt' }}>Wynajmującym:</strong></p>
                <p>
                    <strong>{data.landlordFullName || '____________________'}</strong>
                    , zam. {data.landlordAddress || '____________________'}
                </p>
                {data.landlordPesel && (
                    <p>
                        PESEL: <strong>{data.landlordPesel}</strong>
                        {!landlordPeselValid && (
                            <span style={{
                                marginLeft: '8px',
                                color: '#c62828',
                                fontSize: '9pt',
                                fontStyle: 'italic',
                            }}>
                                (niezweryfikowany)
                            </span>
                        )}
                    </p>
                )}
                {(data.landlordPhone || data.landlordEmail) && (
                    <p style={{ fontSize: '10pt', color: '#666' }}>
                        {data.landlordPhone && `tel: ${data.landlordPhone}`}
                        {data.landlordPhone && data.landlordEmail && ' • '}
                        {data.landlordEmail && `email: ${data.landlordEmail}`}
                    </p>
                )}
                <p style={{ fontStyle: 'italic', marginTop: '4px' }}>
                    zwanym dalej <strong>Wynajmującym</strong>
                </p>
            </div>

            {/* Tenant */}
            <div style={{ paddingLeft: '24px', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                <p><strong style={{ fontSize: '12pt' }}>Najemcą:</strong></p>
                <p>
                    <strong>{data.tenantFullName || '____________________'}</strong>
                    , zam. {data.tenantAddress || '____________________'}
                </p>
                {data.tenantPesel && (
                    <p>
                        PESEL: <strong>{data.tenantPesel}</strong>
                        {!tenantPeselValid && (
                            <span style={{
                                marginLeft: '8px',
                                color: '#c62828',
                                fontSize: '9pt',
                                fontStyle: 'italic',
                            }}>
                                (niezweryfikowany)
                            </span>
                        )}
                    </p>
                )}
                {(data.tenantPhone || data.tenantEmail) && (
                    <p style={{ fontSize: '10pt', color: '#666' }}>
                        {data.tenantPhone && `tel: ${data.tenantPhone}`}
                        {data.tenantPhone && data.tenantEmail && ' • '}
                        {data.tenantEmail && `email: ${data.tenantEmail}`}
                    </p>
                )}
                <p style={{ fontStyle: 'italic', marginTop: '4px' }}>
                    zwanym dalej <strong>Najemcą</strong>
                </p>
            </div>

            {/* Property */}
            <div style={{ marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <h2 style={{
                    fontSize: '12pt',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    marginTop: '16px',
                    color: '#3a3a3a',
                    borderBottom: '1px solid #d4d4d4',
                    paddingBottom: '4px',
                }}>
                    § 1. Przedmiot najmu
                </h2>

                <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                    1. Wynajmujący oddaje Najemcy do używania lokal mieszkalny/użytkowy,
                    położony: <strong>{data.propertyAddress || '____________________'}</strong>
                    {data.propertyArea && ` o powierzchni ${data.propertyArea} m²`}
                    {data.propertyFloor && `, na ${data.propertyFloor} piętrze`}
                    {data.propertyRooms && `, ${data.propertyRooms} pokoje`}.
                </p>

                {data.propertyDescription && (
                    <p style={{
                        marginBottom: '8px',
                        paddingLeft: '16px',
                        borderLeft: '2px solid #7c6a3e',
                        fontStyle: 'italic',
                        color: '#555',
                    }}>
                        {data.propertyDescription}
                    </p>
                )}

                <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                    2. Najem zostaje zawarty na okres{' '}
                    {isIndefinite ? (
                        <strong>nieokreślony</strong>
                    ) : (
                        <>
                            <strong>określony</strong> od dnia{' '}
                            <strong>{startDateFormatted}</strong> r. do dnia{' '}
                            <strong>{endDateFormatted}</strong> r.
                        </>
                    )}
                    .
                </p>
            </div>

            {/* Rent */}
            <div style={{ marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <h2 style={{
                    fontSize: '12pt',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    marginTop: '16px',
                    color: '#3a3a3a',
                    borderBottom: '1px solid #d4d4d4',
                    paddingBottom: '4px',
                }}>
                    § 2. Czynsz i opłaty
                </h2>

                {monthlyRent > 0 ? (
                    <>
                        <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                            1. Najemca zobowiązuje się płacić Wynajmującemu czynsz w wysokości:
                        </p>

                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginBottom: '12px',
                            marginTop: '8px',
                        }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '6px 12px', border: '1px solid #e0e0e0' }}>
                                        Czynsz netto
                                    </td>
                                    <td style={{
                                        padding: '6px 12px',
                                        border: '1px solid #e0e0e0',
                                        fontWeight: 'bold',
                                        textAlign: 'right',
                                    }}>
                                        {formatCurrency(monthlyRent)} zł
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '6px 12px', border: '1px solid #e0e0e0' }}>
                                        VAT ({vatRate}%)
                                    </td>
                                    <td style={{
                                        padding: '6px 12px',
                                        border: '1px solid #e0e0e0',
                                        textAlign: 'right',
                                    }}>
                                        {formatCurrency(grossRent - monthlyRent)} zł
                                    </td>
                                </tr>
                                <tr style={{ backgroundColor: '#f9f9f9' }}>
                                    <td style={{
                                        padding: '8px 12px',
                                        border: '1px solid #e0e0e0',
                                        fontWeight: 'bold',
                                    }}>
                                        Czynsz brutto miesięcznie
                                    </td>
                                    <td style={{
                                        padding: '8px 12px',
                                        border: '1px solid #e0e0e0',
                                        fontWeight: 'bold',
                                        textAlign: 'right',
                                        color: '#7c6a3e',
                                    }}>
                                        {formatCurrency(grossRent)} zł
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                            słownie: <strong style={{ fontStyle: 'italic' }}>
                                {numberToWords(grossRent)}
                            </strong>
                        </p>

                        {data.utilitiesIncluded && (
                            <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                                2. W czynszu wliczone są opłaty za media (prąd, woda, ogrzewanie, internet).
                            </p>
                        )}

                        {!data.utilitiesIncluded && data.utilitiesCost && (
                            <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                                2. Najemca ponosi dodatkowo koszty mediów w wysokości szacunkowej{' '}
                                <strong>{formatCurrency(parseFloat(data.utilitiesCost.replace(',', '.')))} zł</strong>
                                {' '}miesięcznie, rozliczane na podstawie wskazań liczników.
                            </p>
                        )}
                    </>
                ) : (
                    <p style={{ color: '#999', fontStyle: 'italic' }}>
                        [ czynsz nie został określony ]
                    </p>
                )}

                {deposit > 0 && (
                    <>
                        <p style={{ marginBottom: '4px', marginTop: '12px', textAlign: 'justify' }}>
                            3. Najemca wpłaca kaucję zabezpieczającą w wysokości{' '}
                            <strong>{formatCurrency(deposit)} zł</strong>
                            {' '}(słownie: {numberToWords(deposit)}).
                        </p>
                        <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                            Kaucja podlega zwrotowi w terminie{' '}
                            <strong>{data.depositReturnDays} dni</strong> od dnia zakończenia najmu,
                            pomniejszona o ewentualne należności Wynajmującego.
                        </p>
                    </>
                )}
            </div>

            {/* Termination */}
            <div style={{ marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                <h2 style={{
                    fontSize: '12pt',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    marginTop: '16px',
                    color: '#3a3a3a',
                    borderBottom: '1px solid #d4d4d4',
                    paddingBottom: '4px',
                }}>
                    § 3. Wypowiedzenie umowy
                </h2>

                <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                    Umowa może być wypowiedziana przez każdą ze stron z zachowaniem okresu
                    wypowiedzenia wynoszącego <strong>{data.noticePeriod || '1 miesiąc'}</strong>.
                </p>

                {isIndefinite && (
                    <p style={{ marginBottom: '8px', textAlign: 'justify', fontStyle: 'italic' }}>
                        W przypadku umowy na czas nieokreślony, okres wypowiedzenia biegnie od
                        pierwszego dnia miesiąca następującego po miesiącu, w którym złożono
                        oświadczenie o wypowiedzeniu.
                    </p>
                )}
            </div>

            {/* Final provisions */}
            <div style={{ marginBottom: '32px', position: 'relative', zIndex: 2 }}>
                <h2 style={{
                    fontSize: '12pt',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    marginTop: '16px',
                    color: '#3a3a3a',
                    borderBottom: '1px solid #d4d4d4',
                    paddingBottom: '4px',
                }}>
                    § 4. Postanowienia końcowe
                </h2>

                <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                    1. Wszelkie zmiany umowy wymagają formy pisemnej pod rygorem nieważności.
                </p>
                <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                    2. Najemca zobowiązuje się do używania lokalu zgodnie z jego przeznaczeniem
                    oraz do utrzymywania go w należytym stanie.
                </p>
                <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                    3. Wynajmujący zobowiązuje się do wydania lokalu w stanie przydatnym do umówionego użytku.
                </p>
                <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                    4. W sprawach nieuregulowanych niniejszą umową stosuje się przepisy
                    Kodeksu cywilnego oraz Ustawy o ochronie praw lokatorów.
                </p>
                <p style={{ marginBottom: '8px', textAlign: 'justify' }}>
                    5. Umowę sporządzono w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze stron.
                </p>
            </div>

            {/* Signatures */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '48px',
                marginBottom: '24px',
                position: 'relative',
                zIndex: 2,
            }}>
                <div style={{ width: '45%' }}>
                    <div style={{ height: '60px' }}></div>
                    <div style={{
                        borderTop: '1px solid #1e1e1e',
                        paddingTop: '8px',
                        marginTop: '40px',
                        fontSize: '10pt',
                        textAlign: 'center',
                    }}>
                        <strong>Wynajmujący</strong>
                        <br />
                        {data.landlordFullName && (
                            <span style={{ fontSize: '9pt', color: '#666' }}>
                                ({data.landlordFullName})
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ width: '45%' }}>
                    <div style={{ height: '60px' }}></div>
                    <div style={{
                        borderTop: '1px solid #1e1e1e',
                        paddingTop: '8px',
                        marginTop: '40px',
                        fontSize: '10pt',
                        textAlign: 'center',
                    }}>
                        <strong>Najemca</strong>
                        <br />
                        {data.tenantFullName && (
                            <span style={{ fontSize: '9pt', color: '#666' }}>
                                ({data.tenantFullName})
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Print footer */}
            {variant === 'print' && (
                <div style={{
                    marginTop: '32px',
                    fontSize: '8pt',
                    color: '#6c6c6c',
                    textAlign: 'center',
                    borderTop: '1px dashed #d4d4d4',
                    paddingTop: '16px',
                    position: 'relative',
                    zIndex: 2,
                }}>
                    <p>
                        Dokument wygenerowany elektronicznie w systemie ArchonLex w dniu{' '}
                        {formatDatePL(new Date().toISOString())} r.
                        Ważny bez podpisu odręcznego.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RentalAgreementPreview;